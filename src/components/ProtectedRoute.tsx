import { useEffect, useState, ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [needsMFA, setNeedsMFA] = useState(false);

  useEffect(() => {
    const checkAuthAndMFA = async () => {
      try {
        // Check if user is authenticated
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          setLoading(false);
          return;
        }

        setUser(currentUser);

        // Check if user needs daily MFA verification
        const { data: mfaNeeded, error } = await supabase.rpc('needs_daily_mfa');

        if (error) {
          console.error('Error checking MFA status:', error);
          // On error, allow access (fail open for better UX)
          setNeedsMFA(false);
        } else {
          setNeedsMFA(mfaNeeded === true);
        }

        setLoading(false);
      } catch (err) {
        console.error('Auth check error:', err);
        setLoading(false);
      }
    };

    checkAuthAndMFA();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to sign in
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Authenticated but needs MFA - redirect to MFA challenge
  if (needsMFA) {
    return <Navigate to="/auth/mfa-challenge" state={{ from: location }} replace />;
  }

  // Authenticated and MFA verified (or not required) - allow access
  // Support both Outlet (for route elements) and children (for wrapper pattern)
  return children ? <>{children}</> : <Outlet />;
};

export const AuthRoute = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticating } = useAuth();
  const location = useLocation();

  // If user is authenticated and NOT currently logging in, redirect to dashboard
  // The isAuthenticating flag prevents this during the login flow
  if (user && !isAuthenticating) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Otherwise, show the auth page (sign in, sign up, etc.)
  return <>{children}</>;
};
