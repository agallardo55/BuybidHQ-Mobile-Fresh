
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthUser, AuthContextType } from '@/types/auth';
import { robustSignOut } from '@/utils/robust-signout';

// Enhanced context type with better typing
interface EnhancedAuthContextType extends AuthContextType {
  user: AuthUser | null;
  enrichUserProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  // TODO: Add MFA state when implementing
  // mfaRequired?: boolean;
  // emailConfirmationRequired?: boolean;
}

const AuthContext = createContext<EnhancedAuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  enrichUserProfile: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Public method to enrich user after login (non-blocking)
  const enrichUserProfile = async () => {
    if (!user) return;
    
    try {
      console.log('AuthContext: Starting background enrichment for:', user.id);
      const enrichedUser = await enrichUserWithProfile(user);
      setUser(enrichedUser);
      console.log('AuthContext: Background enrichment completed');
    } catch (error) {
      console.warn('AuthContext: Background enrichment failed (non-blocking):', error);
    }
  };

  // Robust sign out function
  const signOut = async () => {
    console.log('AuthContext: Initiating sign out...');
    try {
      await robustSignOut({ scope: 'global', clearHistory: true });
    } catch (error) {
      console.error('AuthContext: Sign out error:', error);
      // Fallback - clear local state and navigate
      setUser(null);
      setSession(null);
      navigate('/signin', { replace: true });
    }
  };

  // Helper function to enrich user with profile data and roles
  const enrichUserWithProfile = async (authUser: User): Promise<AuthUser> => {
    console.log('AuthContext: Starting user enrichment for:', authUser.id);
    
    try {
      console.log('AuthContext: Querying buybidhq_users table...');
      
      // Query with a reasonable timeout to prevent hanging
      // Use AbortController for proper timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      try {
        const { data: profile, error: profileError } = await supabase
          .from('buybidhq_users')
          .select('account_id, dealership_id, role')
          .eq('id', authUser.id)
          .abortSignal(controller.signal)
          .single();
        
        clearTimeout(timeoutId);
        
        console.log('AuthContext: Profile query result:', { profile, profileError });
          
        if (profileError) {
          // Check if this was an abort/timeout error
          const isAbortError = profileError.code === '20' || 
                              profileError.message?.includes('aborted') ||
                              profileError.name === 'AbortError';
          
          if (isAbortError) {
            console.warn('AuthContext: Profile query timed out (returning basic user)');
          } else {
            console.warn('AuthContext: Profile fetch failed (406/RLS):', profileError.message);
          }
          
          // Return basic user, don't crash - this handles 406 errors and timeouts gracefully
          return {
            ...authUser,
            app_metadata: {
              ...authUser.app_metadata,
              role: 'basic',
              app_role: 'member',
              account_id: null,
              dealership_id: null,
            }
          } as AuthUser;
        }

        if (!profile) {
          console.warn('AuthContext: No profile found for user:', authUser.id);
          // Return basic user, don't crash
          return {
            ...authUser,
            app_metadata: {
              ...authUser.app_metadata,
              role: 'basic',
              app_role: 'member',
              account_id: null,
              dealership_id: null,
            }
          } as AuthUser;
        }

        // Fetch user roles from secure user_roles table (optional)
        let highestRole = 'member';
        try {
          const rolesController = new AbortController();
          const rolesTimeoutId = setTimeout(() => rolesController.abort(), 2000); // 2 second timeout for roles
          
          try {
            const { data: roles, error: rolesError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', authUser.id)
              .eq('is_active', true)
              .abortSignal(rolesController.signal);

            clearTimeout(rolesTimeoutId);

            if (!rolesError && roles && !rolesController.signal.aborted) {
              // Determine highest role (prioritize super_admin > account_admin > manager > member)
              const roleHierarchy = { 
                member: 1, 
                manager: 2, 
                account_admin: 3, 
                super_admin: 4 
              };
              
              highestRole = roles.reduce((highest, r) => {
                const currentLevel = roleHierarchy[r.role as keyof typeof roleHierarchy] || 0;
                const highestLevel = roleHierarchy[highest as keyof typeof roleHierarchy] || 0;
                return currentLevel > highestLevel ? r.role : highest;
              }, 'member');
            }
          } catch (rolesTimeoutError) {
            clearTimeout(rolesTimeoutId);
            console.warn('AuthContext: Roles fetch timed out (using default role):', rolesTimeoutError);
            // Continue with default role
          }
        } catch (rolesError) {
          console.warn('AuthContext: Roles fetch failed:', rolesError);
          // Continue with default role
        }

        console.log('AuthContext: User enriched successfully');
        
        // Merge profile and role data into app_metadata
        return {
          ...authUser,
          app_metadata: {
            ...authUser.app_metadata,
            role: profile.role, // Keep legacy role for backwards compatibility
            app_role: highestRole, // Use highest role from user_roles table
            account_id: profile.account_id,
            dealership_id: profile.dealership_id,
          }
        } as AuthUser;
      } catch (queryError: any) {
        clearTimeout(timeoutId);
        
        // Handle timeout (AbortError when timeout triggers) or other query errors
        if (queryError?.name === 'AbortError' || 
            queryError?.code === '20' || 
            queryError?.message?.includes('aborted') ||
            queryError?.message?.includes('Query timeout')) {
          console.warn('AuthContext: Profile query timed out (returning basic user)');
        } else {
          console.warn('AuthContext: Profile query error:', queryError?.message || queryError);
        }
        
        // Return basic user as fallback
        return {
          ...authUser,
          app_metadata: {
            ...authUser.app_metadata,
            role: 'basic',
            app_role: 'member',
            account_id: null,
            dealership_id: null,
          }
        } as AuthUser;
      }
    } catch (error) {
      console.warn('AuthContext: Enrichment error (non-blocking):', error);
      
      // Return basic user as fallback - never crash, never throw
      return {
        ...authUser,
        app_metadata: {
          ...authUser.app_metadata,
          role: 'basic',
          app_role: 'member',
          account_id: null,
          dealership_id: null,
        }
      } as AuthUser;
    }
  };

  useEffect(() => {
    let warningTimer: NodeJS.Timeout;
    let refreshTimer: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    let hasCompleted = false;

    // Set a timeout to stop loading after 2 seconds max - don't block the app
    // This ensures the app can render even if getSession() is slow
    timeoutId = setTimeout(() => {
      if (!hasCompleted) {
        console.warn('AuthContext: Session check timeout reached, allowing app to render');
        setIsLoading(false);
      }
    }, 2000);

    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      clearTimeout(timeoutId);
      hasCompleted = true;
      
      console.log('AuthContext: Initial session check:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        error 
      });
      
      try {
        if (session?.user) {
          console.log('AuthContext: Session found, enriching user:', session.user.id);
          
          try {
            // Skip enrichment during sign-in to prevent blocking
            const basicUser = {
              ...session.user,
              app_metadata: {
                ...session.user.app_metadata,
                role: 'basic',
                app_role: 'member',
                account_id: null,
                dealership_id: null,
              }
            } as AuthUser;
            
            setUser(basicUser);
            setSession(session);
            console.log('AuthContext: User signed in with basic profile (enrichment deferred)');
          } catch (enrichError) {
            console.error('AuthContext: Error setting basic user:', enrichError);
            
            // Fallback: set basic user without enrichment
            setUser({
              ...session.user,
              app_metadata: session.user.app_metadata || {},
              user_metadata: session.user.user_metadata || {},
            } as AuthUser);
            setSession(session);
          }

          // Set up session expiration warning
          const expiresAt = new Date(session.expires_at! * 1000);
          const timeUntilExpiry = expiresAt.getTime() - Date.now();
          const warningTime = timeUntilExpiry - (10 * 60 * 1000); // 10 minutes before expiry

          if (warningTime > 0) {
            warningTimer = setTimeout(() => {
              toast.warning("Your session will expire in 10 minutes. Please save any unsaved work.");
            }, warningTime);
          }
        } else {
          console.log('AuthContext: No session found');
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('AuthContext: Fatal error in session initialization:', error);
        setUser(null);
        setSession(null);
      } finally {
        // ✅ Only set loading false AFTER user state is determined
        setIsLoading(false);
        console.log('AuthContext: Initialization complete');
      }
    }).catch((error) => {
      clearTimeout(timeoutId);
      hasCompleted = true;
      console.error('AuthContext: Error getting session:', error);
      setUser(null);
      setSession(null);
      setIsLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', { event, session: session ? 'exists' : 'none' });

      // Don't process during initial load (already handled by getSession)
      if (event === 'INITIAL_SESSION') {
        console.log('AuthContext: Skipping INITIAL_SESSION (already processed)');
        return;
      }

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthContext: Processing user from auth state change:', session.user.id);
          
          // Set user immediately without enrichment to avoid blocking login
          // Enrichment will happen in background if needed
          try {
            const basicUser = {
              ...session.user,
              app_metadata: {
                ...session.user.app_metadata,
                role: 'basic',
                app_role: 'member',
                account_id: null,
                dealership_id: null,
              }
            } as AuthUser;
            
            setUser(basicUser);
            setSession(session);
            console.log('AuthContext: User set from auth state change (basic profile, enrichment deferred)');
            
            // Enrich in background (non-blocking)
            enrichUserWithProfile(session.user).then((enrichedUser) => {
              setUser(enrichedUser);
              console.log('AuthContext: User enriched in background');
            }).catch((enrichError) => {
              console.warn('AuthContext: Background enrichment failed (non-blocking):', enrichError);
              // Keep basic user if enrichment fails
            });
          } catch (error) {
            console.error('AuthContext: Error setting user on sign in:', error);
            // Fallback
            setUser({
              ...session.user,
              app_metadata: session.user.app_metadata || {},
              user_metadata: session.user.user_metadata || {},
            } as AuthUser);
            setSession(session);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthContext: User signed out');
          setUser(null);
          setSession(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('AuthContext: Token refreshed');
          setSession(session);
          // Don't re-enrich on token refresh, just update session
        } else if (event === 'TOKEN_REFRESH_FAILED') {
          console.error('AuthContext: Token refresh failed, signing out');
          await supabase.auth.signOut();
          localStorage.clear();
          setUser(null);
          setSession(null);
          navigate('/signin');
        } else if (event === 'USER_UPDATED' && session?.user) {
          console.log('AuthContext: User updated');
          
          try {
            const enrichedUser = await enrichUserWithProfile(session.user);
            setUser(enrichedUser);
            setSession(session);
          } catch (enrichError) {
            console.error('AuthContext: Error enriching user on update:', enrichError);
            // Keep existing user if enrichment fails
          }
        }
      } catch (error) {
        console.error('AuthContext: Error in auth state change handler:', error);
      }
      
      // Note: No setIsLoading here - only initial load controls loading state

      // Set up auto-refresh timer for active sessions
      if (session?.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000);
        const timeUntilExpiry = expiresAt.getTime() - Date.now();
        
        // Set up auto-refresh 5 minutes before expiration
        if (timeUntilExpiry > 5 * 60 * 1000) {
          refreshTimer = setTimeout(async () => {
            try {
              const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
              if (error) {
                console.error('Session refresh error:', error);
                toast.error("Session refresh failed. Please sign in again.");
                navigate('/signin');
              } else if (refreshedSession?.user) {
                setSession(refreshedSession);
                try {
                  const enrichedUser = await enrichUserWithProfile(refreshedSession.user);
                  setUser(enrichedUser);
                } catch (enrichError) {
                  console.error('Error enriching user during refresh:', enrichError);
                  // Use fallback user data
                  setUser({
                    ...refreshedSession.user,
                    app_metadata: refreshedSession.user.app_metadata || {},
                    user_metadata: refreshedSession.user.user_metadata || {},
                  } as AuthUser);
                }
              }
            } catch (refreshError) {
              console.error('Session refresh failed:', refreshError);
              toast.error("Session refresh failed. Please sign in again.");
              navigate('/signin');
            }
          }, timeUntilExpiry - 5 * 60 * 1000);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (warningTimer) clearTimeout(warningTimer);
      if (refreshTimer) clearTimeout(refreshTimer);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, enrichUserProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
