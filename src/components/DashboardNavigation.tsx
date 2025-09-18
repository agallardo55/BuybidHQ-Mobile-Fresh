
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import Logo from "./navigation/Logo";
import NavItems from "./navigation/NavItems";
import UserActions from "./navigation/UserActions";
import MobileMenu from "./navigation/MobileMenu";
import NotificationPanel from "./notifications/NotificationPanel";

interface DashboardNavigationProps {
  onNotificationPanelChange?: (isOpen: boolean) => void;
}

const DashboardNavigation = ({ onNotificationPanelChange }: DashboardNavigationProps = {}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isMobile = useIsMobile();
  const { currentUser, isLoading } = useCurrentUser();

  const canAccessUsers = currentUser?.role === 'admin' || currentUser?.role === 'dealer';
  const canAccessDealerships = currentUser?.role !== 'associate';

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    ...(canAccessDealerships ? [{ name: "Dealerships", href: "/dealerships" }] : []),
    { name: "Buyers", href: "/buyers" },
    ...(canAccessUsers ? [{ name: "Users", href: "/users" }] : []),
  ];

  useEffect(() => {
    fetchUnreadCount();
    subscribeToNotifications();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .is('read_at', null)
        .is('cleared_at', null);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNotificationPanelToggle = () => {
    const newState = !isNotificationPanelOpen;
    setIsNotificationPanelOpen(newState);
    onNotificationPanelChange?.(newState);
  };

  const handleCloseNotificationPanel = () => {
    setIsNotificationPanelOpen(false);
    onNotificationPanelChange?.(false);
  };

  // Auto-close panel on mobile breakpoint
  useEffect(() => {
    if (isMobile && isNotificationPanelOpen) {
      handleCloseNotificationPanel();
    }
  }, [isMobile]);

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
            <NavItems 
              items={navItems}
              className="hidden md:flex items-center space-x-8 ml-8"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <UserActions 
              unreadCount={unreadCount}
              onLogout={handleLogout}
              onNotificationToggle={handleNotificationPanelToggle}
              isNotificationPanelOpen={isNotificationPanelOpen}
              className="hidden md:flex"
            />
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileMenu 
        isOpen={isOpen}
        navItems={navItems}
        unreadCount={unreadCount}
        onLogout={handleLogout}
        onClose={() => setIsOpen(false)}
      />

      {!isMobile && (
        <NotificationPanel
          isOpen={isNotificationPanelOpen}
          onClose={handleCloseNotificationPanel}
        />
      )}
    </nav>
  );
};

export default DashboardNavigation;
