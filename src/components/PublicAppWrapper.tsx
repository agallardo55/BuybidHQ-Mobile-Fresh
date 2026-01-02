import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BetaNoticeModal } from './BetaNoticeModal';
import { isAdmin } from '@/utils/auth-helpers';

interface PublicAppWrapperProps {
  children: ReactNode;
}

export const PublicAppWrapper = ({ children }: PublicAppWrapperProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const [showBetaModal, setShowBetaModal] = useState(false);

  console.log('🔍 PublicAppWrapper: Rendering', { pathname: location.pathname });

  // Check if current route is a public bid response page
  // Note: AuthProvider is now at App.tsx level, so we just render children
  // Public bid pages don't need special handling since they're already wrapped
  const isPublicBidPage = location.pathname.startsWith('/bid-response/') ||
                         location.pathname.startsWith('/quick-bid/');

  if (isPublicBidPage) {
    console.log('🔍 PublicAppWrapper: Public bid page detected');
  }

  // Show beta modal ONLY on dashboard page (once per session for non-admin users)
  useEffect(() => {
    // ONLY show modal on dashboard page
    const isDashboardPage = location.pathname === '/dashboard';

    if (user && !isAdmin(user) && isDashboardPage) {
      // Check if modal has been shown this session
      const hasSeenBetaModal = sessionStorage.getItem('beta_modal_shown');

      if (!hasSeenBetaModal) {
        // Small delay to ensure smooth transition after login
        const timer = setTimeout(() => {
          setShowBetaModal(true);
          sessionStorage.setItem('beta_modal_shown', 'true');
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [user, location.pathname]);

  const handleBetaModalClose = () => {
    setShowBetaModal(false);
  };

  // Just render children - AuthProvider is now in App.tsx
  return (
    <>
      {children}
      {user && !isAdmin(user) && (
        <BetaNoticeModal
          open={showBetaModal}
          onOpenChange={handleBetaModalClose}
        />
      )}
    </>
  );
};