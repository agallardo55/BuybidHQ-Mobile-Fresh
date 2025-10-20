import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Allow bid response and quick bid routes to be public
  if (location.pathname.startsWith('/bid-response/') || location.pathname.startsWith('/quick-bid/')) {
    return <>{children}</>;
  }

  if (isLoading) {
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
    // Redirect them to the /signin page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AuthRoute = ({ children }: { children: ReactNode }) => {
  console.log('AuthRoute component loaded successfully');
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [forceShow, setForceShow] = useState(false);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('AuthRoute: Loading timeout reached, forcing display');
        setForceShow(true);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Reset forceShow when loading completes
  useEffect(() => {
    if (!isLoading) {
      setForceShow(false);
    }
  }, [isLoading]);

  if (isLoading && !forceShow) {
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
    // If they're already signed in, redirect to the last page they were trying to visit
    // or to the dashboard if there's no saved location
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};