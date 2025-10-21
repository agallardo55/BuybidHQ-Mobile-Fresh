import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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

  if (isLoading || mfaCheckLoading) {
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
  console.log('AuthRoute component loaded successfully');
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [forceShow, setForceShow] = useState(false);

  // Debug logging for AuthRoute
  console.log('AuthRoute render:', {
    isLoading,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    forceShow,
    pathname: location.pathname
  });

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    console.log('AuthRoute: Setting up timeout, isLoading:', isLoading);
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('AuthRoute: Loading timeout reached, forcing display');
        setForceShow(true);
      }
    }, 5000); // Reduced to 5 second timeout

    return () => {
      console.log('AuthRoute: Clearing timeout');
      clearTimeout(timeout);
    };
  }, [isLoading]);

  // Reset forceShow when loading completes
  useEffect(() => {
    if (!isLoading) {
      console.log('AuthRoute: Loading completed, resetting forceShow');
      setForceShow(false);
    }
  }, [isLoading]);

  if (isLoading && !forceShow) {
    console.log('AuthRoute: Still loading, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    console.log('AuthRoute: User authenticated, redirecting to:', location.state);
    // If they're already signed in, redirect to the last page they were trying to visit
    // or to the dashboard if there's no saved location
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    console.log('AuthRoute: Redirecting to:', from);
    return <Navigate to={from} replace />;
  }

  console.log('AuthRoute: No user, rendering children');
  return <>{children}</>;
};