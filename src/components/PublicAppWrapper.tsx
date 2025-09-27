import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

interface PublicAppWrapperProps {
  children: ReactNode;
}

export const PublicAppWrapper = ({ children }: PublicAppWrapperProps) => {
  const location = useLocation();
  
  // Check if current route is a public bid response page
  const isPublicBidPage = location.pathname.startsWith('/bid-response/') || 
                         location.pathname.startsWith('/quick-bid/');
  
  // For public bid pages, render without AuthProvider to avoid any auth initialization
  if (isPublicBidPage) {
    return <>{children}</>;
  }
  
  // For all other pages, wrap with AuthProvider
  return <AuthProvider>{children}</AuthProvider>;
};