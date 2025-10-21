import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const RecoveryRedirector = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check URL for password reset tokens immediately
    const checkForPasswordReset = async () => {
      const hash = window.location.hash;
      const search = window.location.search;
      
      const hasResetToken = hash.includes('type=recovery') || 
                           search.includes('type=recovery') ||
                           hash.includes('access_token') ||
                           search.includes('access_token');
      
      if (hasResetToken && location.pathname !== '/reset-password') {
        // Check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('Password recovery detected, redirecting to reset-password');
          navigate('/reset-password', { replace: true });
        } else {
          // User is logged in, clear the stale recovery token from URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    };

    // Check immediately on mount
    checkForPasswordReset();

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && location.pathname !== '/reset-password' && !session) {
        console.log('PASSWORD_RECOVERY event detected, redirecting');
        navigate('/reset-password', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname, location.hash]);

  return null;
};