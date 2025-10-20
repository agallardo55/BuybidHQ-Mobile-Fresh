
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthUser, AuthContextType } from '@/types/auth';

// Enhanced context type with better typing
interface EnhancedAuthContextType extends AuthContextType {
  user: AuthUser | null;
  // TODO: Add MFA state when implementing
  // mfaRequired?: boolean;
  // emailConfirmationRequired?: boolean;
}

const AuthContext = createContext<EnhancedAuthContextType>({
  user: null,
  session: null,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to enrich user with profile data and roles
  const enrichUserWithProfile = async (authUser: User): Promise<AuthUser> => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('User enrichment timeout')), 10000); // 10 second timeout
      });

      const enrichPromise = async () => {
        // Fetch user profile data
        const { data: profile, error: profileError } = await supabase
          .from('buybidhq_users')
          .select('account_id, dealership_id, role')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          // Return a fallback user with basic data until migration is applied
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

        // Fetch user roles from secure user_roles table
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authUser.id)
          .eq('is_active', true);

        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          // Continue with default role if roles can't be fetched
        }

        // Determine highest role (prioritize super_admin > account_admin > manager > member)
        const roleHierarchy = { 
          member: 1, 
          manager: 2, 
          account_admin: 3, 
          super_admin: 4 
        };
        
        const highestRole = roles?.reduce((highest, r) => {
          const currentLevel = roleHierarchy[r.role as keyof typeof roleHierarchy] || 0;
          const highestLevel = roleHierarchy[highest as keyof typeof roleHierarchy] || 0;
          return currentLevel > highestLevel ? r.role : highest;
        }, 'member') || 'member';

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
      };

      return await Promise.race([enrichPromise(), timeoutPromise]);
    } catch (error) {
      console.error('Error enriching user:', error);
      // Return a fallback user with basic data until migration is applied
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

    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthContext: Checking session...', { session: session ? 'exists' : 'null' });
      
      try {
        if (session?.user) {
          console.log('AuthContext: User found in session:', session.user.id);
          try {
            const enrichedUser = await enrichUserWithProfile(session.user);
            setUser(enrichedUser);
          } catch (error) {
            console.error('AuthContext: Error enriching user:', error);
            // Use fallback user data until migration is applied
            setUser({
              ...session.user,
              app_metadata: {
                ...session.user.app_metadata,
                role: 'basic',
                app_role: 'member',
                account_id: null,
                dealership_id: null,
              }
            } as AuthUser);
          }
        } else {
          console.log('AuthContext: No user in session, setting user to null');
          setUser(null);
        }
        
        setSession(session);

        // Set up session expiration warning if session exists
        if (session) {
          const expiresAt = new Date(session.expires_at! * 1000);
          const timeUntilExpiry = expiresAt.getTime() - Date.now();
          const warningTime = timeUntilExpiry - (10 * 60 * 1000); // 10 minutes before expiry

          if (warningTime > 0) {
            warningTimer = setTimeout(() => {
              toast.warning("Your session will expire in 10 minutes. Please save any unsaved work.");
            }, warningTime);
          }
        }
      } catch (error) {
        console.error('AuthContext: Error processing session:', error);
        setUser(null);
        setSession(session);
      } finally {
        // Always set loading to false, regardless of success or failure
        setIsLoading(false);
      }
    }).catch((error) => {
      console.error('AuthContext: Error getting session:', error);
      setUser(null);
      setSession(null);
      setIsLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', { event, session: session ? 'exists' : 'null' });
      
      try {
        // Set session immediately
        setSession(session);
        
        if (session?.user) {
          console.log('AuthContext: Processing user from auth state change:', session.user.id);
          try {
            const enrichedUser = await enrichUserWithProfile(session.user);
            setUser(enrichedUser);
          } catch (error) {
            console.error('AuthContext: Error enriching user:', error);
            // Use fallback user data until migration is applied
            setUser({
              ...session.user,
              app_metadata: {
                ...session.user.app_metadata,
                role: 'basic',
                app_role: 'member',
                account_id: null,
                dealership_id: null,
              }
            } as AuthUser);
          }
        } else {
          console.log('AuthContext: No user in auth state change, setting user to null');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Error processing auth state change:', error);
        setUser(null);
        setSession(session);
      } finally {
        // Always set loading to false, regardless of success or failure
        setIsLoading(false);
      }

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
                  // Use fallback user data until migration is applied
                  setUser({
                    ...refreshedSession.user,
                    app_metadata: {
                      ...refreshedSession.user.app_metadata,
                      role: 'basic',
                      app_role: 'member',
                      account_id: null,
                      dealership_id: null,
                    }
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
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
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
