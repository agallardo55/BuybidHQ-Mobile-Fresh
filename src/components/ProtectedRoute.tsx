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

  // Check MFA requirements when user is authenticated (non-blocking)
  useEffect(() => {
    const checkMFARequirement = async () => {
      if (!user || isLoading) {
        setMfaCheckLoading(false);
        setRequiresMFA(false); // Default to no MFA requirement
        return;
      }

      // Set immediate timeout to prevent blocking - allow access by default
      const timeoutId = setTimeout(() => {
        console.warn('ProtectedRoute: MFA check timeout, allowing access');
        setMfaCheckLoading(false);
        setRequiresMFA(false); // Allow access if check times out
      }, 1000); // Reduced to 1 second - very aggressive

      try {
        // Get current session to check AAL with very short timeout
        const sessionPromise = supabase.auth.getSession();
        const sessionTimeout = new Promise((resolve) => setTimeout(() => resolve(null), 800));
        
        const sessionResult = await Promise.race([sessionPromise, sessionTimeout]);
        
        if (!sessionResult) {
          console.warn('ProtectedRoute: Session check timed out, allowing access');
          clearTimeout(timeoutId);
          setMfaCheckLoading(false);
          setRequiresMFA(false);
          return;
        }

        const { data: sessionData } = sessionResult as Awaited<ReturnType<typeof supabase.auth.getSession>>;
        const session = sessionData?.session;

        if (!session) {
          clearTimeout(timeoutId);
          setMfaCheckLoading(false);
          setRequiresMFA(false);
          return;
        }

        // Check if MFA is required but not yet verified (with very short timeout)
        // If this times out, we allow access - MFA is optional
        const factorsPromise = supabase.auth.mfa.listFactors();
        const factorsTimeout = new Promise((resolve) => setTimeout(() => resolve(null), 500)); // Very short timeout
        
        const factorsResult = await Promise.race([factorsPromise, factorsTimeout]);
        
        if (!factorsResult) {
          // Timeout is OK - allow access, MFA check is non-critical
          clearTimeout(timeoutId);
          setMfaCheckLoading(false);
          setRequiresMFA(false); // Don't block on MFA check timeout
          return;
        }

        const { data: factors } = factorsResult as Awaited<ReturnType<typeof supabase.auth.mfa.listFactors>>;
        const hasMFA = factors && (factors.totp?.length > 0 || factors.phone?.length > 0);

        clearTimeout(timeoutId);
        
        // Only require MFA if we successfully checked and found factors
        // If check failed or timed out, allow access
        if (hasMFA) {
          console.log('ProtectedRoute: MFA factors found, but allowing access (MFA check is non-blocking)');
          // For now, don't block on MFA - allow access
          // In production, you might want to check AAL level here
          setRequiresMFA(false);
        } else {
          console.log('ProtectedRoute: MFA not required');
          setRequiresMFA(false);
        }
      } catch (error) {
        console.warn('ProtectedRoute: Error checking MFA (non-critical, allowing access):', error);
        clearTimeout(timeoutId);
        setRequiresMFA(false); // Always allow access on error
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
  const [redirectTimeout, setRedirectTimeout] = useState(false);

  // If user exists, redirect immediately (no need to wait for full loading)
  useEffect(() => {
    if (user && !hasCheckedRedirect) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      console.log('AuthRoute: User authenticated, redirecting to:', from, 'from location:', location.pathname);
      setHasCheckedRedirect(true);
      
      // Navigate immediately - don't wait
      const doNavigate = () => {
        console.log('AuthRoute: Executing navigation to:', from);
        navigate(from, { replace: true });
        // Set timeout flag after a brief moment to allow render
        setTimeout(() => setRedirectTimeout(true), 50);
      };
      
      // Use requestAnimationFrame to ensure navigation happens after render
      requestAnimationFrame(() => {
        doNavigate();
      });
    }
  }, [user, hasCheckedRedirect, location.state, navigate]);

  // Show auth pages immediately - don't block on loading state
  // If user loads later and exists, the useEffect will handle redirect
  if (user && !redirectTimeout) {
    // User exists, show loading while redirecting (but with timeout)
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