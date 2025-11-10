import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PublicAppWrapperProps {
  children: ReactNode;
}

export const PublicAppWrapper = ({ children }: PublicAppWrapperProps) => {
  const location = useLocation();
  console.log('🔍 PublicAppWrapper: Rendering', { pathname: location.pathname });
  
  // Check if current route is a public bid response page
  // Note: AuthProvider is now at App.tsx level, so we just render children
  // Public bid pages don't need special handling since they're already wrapped
  const isPublicBidPage = location.pathname.startsWith('/bid-response/') || 
                         location.pathname.startsWith('/quick-bid/');
  
  if (isPublicBidPage) {
    console.log('🔍 PublicAppWrapper: Public bid page detected');
  }
  
  // Just render children - AuthProvider is now in App.tsx
  return <>{children}</>;
};