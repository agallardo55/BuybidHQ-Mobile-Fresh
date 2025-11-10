import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const RecoveryRedirector = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to load before checking
    if (isLoading) return;
    
    // Check URL for password reset tokens
    const hash = window.location.hash;
    const search = window.location.search;
    
    const hasResetToken = hash.includes('type=recovery') || 
                         search.includes('type=recovery') ||
                         hash.includes('access_token') ||
                         search.includes('access_token');
    
    if (hasResetToken && location.pathname !== '/reset-password') {
      if (!session) {
        console.log('Password recovery detected, redirecting to reset-password');
        navigate('/reset-password', { replace: true });
      } else {
        // User is logged in, clear the stale recovery token from URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [navigate, location.pathname, location.hash, session, isLoading]);

  return null;
};