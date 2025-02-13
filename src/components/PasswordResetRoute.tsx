
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const PasswordResetRoute = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useAuth();
  const location = useLocation();

  // We only show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check if this is a password reset attempt by looking for the token in the URL
  const hasResetToken = location.hash.includes('type=recovery');

  // If there's no reset token, redirect to forgot-password
  if (!hasResetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  return <>{children}</>;
};
