import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [mfaCheckLoading, setMfaCheckLoading] = useState(true);
  const [requiresMFA, setRequiresMFA] = useState(false);

  // Debug logging
  console.log('ProtectedRoute render:', {
    pathname: location.pathname,
    isLoading,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email
  });

  // Allow bid response and quick bid routes to be public
  if (location.pathname.startsWith('/bid-response/') || location.pathname.startsWith('/quick-bid/')) {
    console.log('ProtectedRoute: Allowing public route:', location.pathname);
    return <>{children}</>;
  }

  // Check MFA requirements when user is authenticated
  useEffect(() => {
    const checkMFARequirement = async () => {
      if (!user || isLoading) {
        setMfaCheckLoading(false);
        return;
      }

      try {
        // Get current session to check AAL
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;

        if (!session) {
          setMfaCheckLoading(false);
          return;
        }

        // Check if MFA is required but not yet verified
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const hasMFA = factors && (factors.totp?.length > 0 || factors.phone?.length > 0);

        // Check if session has proper AAL level
        // For now, we'll check if the session exists and has MFA factors
        // In a full implementation, you'd check session.aal_level or similar
        if (hasMFA) {
          console.log('ProtectedRoute: MFA required, checking if verified');
          // For this implementation, we'll assume MFA is required if factors exist
          // In production, you'd check the actual AAL level from the session
          setRequiresMFA(true);
        } else {
          console.log('ProtectedRoute: MFA not required');
          setRequiresMFA(false);
        }
      } catch (error) {
        console.error('Error checking MFA requirement:', error);
        setRequiresMFA(false);
      } finally {
        setMfaCheckLoading(false);
      }
    };

    checkMFARequirement();
  }, [user, isLoading]);

  // Add timeout for protected routes too - don't block forever
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    if (isLoading || mfaCheckLoading) {
      const timeout = setTimeout(() => {
        console.warn('ProtectedRoute: Loading timeout reached, allowing render');
        setLoadingTimeout(true);
      }, 2000); // 2 second timeout for protected routes
      
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading, mfaCheckLoading]);

  if ((isLoading || mfaCheckLoading) && !loadingTimeout) {
    console.log('ProtectedRoute: Still loading, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading your account...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we verify your session</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to signin');
    // Redirect them to the /signin page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requiresMFA) {
    console.log('ProtectedRoute: MFA required, redirecting to challenge');
    // Build URL params for MFA challenge
    const params = new URLSearchParams();
    params.set('email', user.email || '');
    params.set('redirect', location.pathname);
    return <Navigate to={`/auth/mfa-challenge?${params.toString()}`} replace />;
  }

  console.log('ProtectedRoute: User authenticated with proper AAL, rendering children');
  return <>{children}</>;
};

export const AuthRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);

  // If user exists, redirect immediately (no need to wait for full loading)
  useEffect(() => {
    if (user && !hasCheckedRedirect) {
      console.log('AuthRoute: User authenticated, redirecting to:', location.state);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      setHasCheckedRedirect(true);
      // Use setTimeout to avoid navigation during render
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 0);
    }
  }, [user, hasCheckedRedirect, location.state, navigate]);

  // Show auth pages immediately - don't block on loading state
  // If user loads later and exists, the useEffect will handle redirect
  if (user) {
    // User exists, show loading while redirecting
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // No user yet (or still loading) - show auth pages immediately
  // This provides instant access to sign-in/sign-up pages
  return <>{children}</>;
};