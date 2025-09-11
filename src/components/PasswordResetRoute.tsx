
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const PasswordResetRoute = ({ children }: { children: ReactNode }) => {
  const { isLoading, user } = useAuth();
  const location = useLocation();

  // We only show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check if this is a password reset attempt by looking for Supabase recovery tokens
  const hasResetToken = location.hash.includes('type=recovery') || 
                       location.search.includes('type=recovery') ||
                       location.hash.includes('access_token') ||
                       location.search.includes('access_token');
  
  // Security: Log navigation without sensitive tokens
  console.log('PasswordResetRoute: Checking reset flow for path:', location.pathname);

  // If there's no reset token and user is logged in, redirect to dashboard
  if (!hasResetToken && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If there's no reset token and user is not logged in, redirect to forgot-password
  if (!hasResetToken && !user) {
    return <Navigate to="/forgot-password" replace />;
  }

  return <>{children}</>;
};
