import { useEffect, useState, ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth(); // Use AuthContext as single source of truth
  const [needsMFA, setNeedsMFA] = useState(false);
  const [checkingMFA, setCheckingMFA] = useState(true);

  useEffect(() => {
    const checkMFA = async () => {
      // Wait for auth to finish loading
      if (authLoading || !user) {
        setCheckingMFA(false);
        return;
      }

      try {
        setCheckingMFA(true);

        // Check for database-backed MFA bypass token (e.g., after payment)
        const { data: bypassToken } = await supabase
          .from('mfa_bypass_tokens')
          .select('*')
          .eq('user_id', user.id)
          .is('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (bypassToken) {
          console.log('Valid MFA bypass token found - skipping MFA check');

          // Mark token as used
          await supabase
            .from('mfa_bypass_tokens')
            .update({
              used_at: new Date().toISOString(),
              used_from_ip: null // Could add IP tracking if needed
            })
            .eq('id', bypassToken.id);

          setNeedsMFA(false);
          setCheckingMFA(false);
          return;
        }

        // Check if user needs daily MFA verification
        const { data: mfaNeeded, error } = await supabase.rpc('needs_daily_mfa');

        if (error) {
          console.error('Error checking MFA status:', error);
          // SECURITY: Fail closed - require MFA verification on error
          setNeedsMFA(true);
        } else {
          setNeedsMFA(mfaNeeded === true);
        }

        setCheckingMFA(false);
      } catch (err) {
        console.error('MFA check error:', err);
        // SECURITY: Fail closed on error
        setNeedsMFA(true);
        setCheckingMFA(false);
      }
    };

    checkMFA();
  }, [user, authLoading]);

  // Combined loading state: either auth is loading OR MFA is being checked
  const isLoading = authLoading || checkingMFA;

  if (isLoading) {
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
    return <Navigate
      to="/auth/mfa-challenge"
      state={{
        from: location,
        isInitialSignIn: false  // Not initial sign-in, require manual code send
      }}
      replace
    />;
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
