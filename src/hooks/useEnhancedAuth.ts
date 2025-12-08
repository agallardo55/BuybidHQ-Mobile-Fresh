/**
 * Enhanced Authentication Hook
 * 
 * Extended auth hook with email confirmation
 * and enhanced session management.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthUser, EmailConfirmation } from '@/types/auth';

interface EnhancedAuthState {
  // Email confirmation state
  emailConfirmation: EmailConfirmation;
  // Session state
  sessionExpiring: boolean;
  sessionRefreshing: boolean;
}

interface EnhancedAuthActions {
  // Email confirmation
  resendConfirmationEmail: () => Promise<boolean>;
  checkEmailConfirmation: () => Promise<boolean>;
  
  // Session management
  refreshSession: () => Promise<boolean>;
  extendSession: () => Promise<boolean>;
  
  // Enhanced sign out with cleanup
  signOutEverywhere: () => Promise<boolean>;
}

export const useEnhancedAuth = () => {
  const { user, session, isLoading } = useAuth();
  const [enhancedState, setEnhancedState] = useState<EnhancedAuthState>({
    emailConfirmation: { required: false, resend_available: true },
    sessionExpiring: false,
    sessionRefreshing: false,
  });

  /**
   * Resend email confirmation
   */
  const resendConfirmationEmail = useCallback(async (): Promise<boolean> => {
    try {
      if (!user?.email) {
        toast.error('No email address found');
        return false;
      }

      // Check if email is already confirmed
      if (user.email_confirmed_at) {
        toast.info('Email is already confirmed');
        return true;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast.error('Failed to resend confirmation email');
        return false;
      }

      setEnhancedState(prev => ({
        ...prev,
        emailConfirmation: {
          ...prev.emailConfirmation,
          sent_at: new Date().toISOString(),
          resend_available: false
        }
      }));

      toast.success('Confirmation email sent');
      
      // Re-enable resend after 60 seconds
      setTimeout(() => {
        setEnhancedState(prev => ({
          ...prev,
          emailConfirmation: {
            ...prev.emailConfirmation,
            resend_available: true
          }
        }));
      }, 60000);

      return true;
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      toast.error('Failed to resend confirmation email');
      return false;
    }
  }, [user]);

  /**
   * Check email confirmation status
   */
  const checkEmailConfirmation = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user: refreshedUser }, error } = await supabase.auth.getUser();
      
      if (error || !refreshedUser) {
        return false;
      }

      const isConfirmed = !!refreshedUser.email_confirmed_at;
      
      setEnhancedState(prev => ({
        ...prev,
        emailConfirmation: {
          ...prev.emailConfirmation,
          required: !isConfirmed,
          confirmed_at: refreshedUser.email_confirmed_at || undefined
        }
      }));

      return isConfirmed;
    } catch (error) {
      console.error('Error checking email confirmation:', error);
      return false;
    }
  }, []);

  /**
   * Refresh session manually
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      setEnhancedState(prev => ({ ...prev, sessionRefreshing: true }));

      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        toast.error('Failed to refresh session');
        return false;
      }

      if (data.session) {
        toast.success('Session refreshed');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast.error('Failed to refresh session');
      return false;
    } finally {
      setEnhancedState(prev => ({ ...prev, sessionRefreshing: false }));
    }
  }, []);

  /**
   * Extend session (refresh if needed)
   */
  const extendSession = useCallback(async (): Promise<boolean> => {
    try {
      if (!session) return false;

      const expiresAt = new Date(session.expires_at! * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      
      // If session expires in less than 10 minutes, refresh it
      if (timeUntilExpiry < 10 * 60 * 1000) {
        return await refreshSession();
      }

      return true;
    } catch (error) {
      console.error('Error extending session:', error);
      return false;
    }
  }, [session, refreshSession]);

  /**
   * Sign out from all devices
   */
  const signOutEverywhere = useCallback(async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        toast.error('Failed to sign out');
        return false;
      }

      // Clear any local storage or cache
      localStorage.clear();
      sessionStorage.clear();

      toast.success('Signed out from all devices');
      return true;
    } catch (error) {
      console.error('Error signing out everywhere:', error);
      toast.error('Failed to sign out');
      return false;
    }
  }, []);

  const actions: EnhancedAuthActions = {
    resendConfirmationEmail,
    checkEmailConfirmation,
    refreshSession,
    extendSession,
    signOutEverywhere,
  };

  return {
    // Base auth state
    user: user as AuthUser | null,
    session,
    isLoading,
    
    // Enhanced state
    ...enhancedState,
    
    // Actions
    ...actions,
    
    // Computed properties
    isEmailConfirmed: !!user?.email_confirmed_at,
    needsEmailConfirmation: !user?.email_confirmed_at && enhancedState.emailConfirmation.required,
    sessionExpiresAt: session ? new Date(session.expires_at! * 1000) : null,
    sessionTimeRemaining: session ? 
      Math.max(0, new Date(session.expires_at! * 1000).getTime() - Date.now()) : 0,
  };
};