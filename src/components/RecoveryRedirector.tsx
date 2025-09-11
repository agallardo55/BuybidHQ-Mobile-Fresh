import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const RecoveryRedirector = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check URL for password reset tokens immediately
    const checkForPasswordReset = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      
      const hasResetToken = hash.includes('type=recovery') || 
                           search.includes('type=recovery') ||
                           hash.includes('access_token') ||
                           search.includes('access_token');
      
      // Security: Remove sensitive token logging
      console.log('Checking for password reset flow');
      
      if (hasResetToken && location.pathname !== '/reset-password') {
        console.log('Redirecting to password reset page');
        navigate('/reset-password', { replace: true });
      }
    };

    // Check immediately
    checkForPasswordReset();

    // Also listen for auth state changes as backup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event received:', event);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected, redirecting');
        navigate('/reset-password', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return null;
};