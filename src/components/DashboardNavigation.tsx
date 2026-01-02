
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationToasts } from "./notifications/useNotificationToasts";
import { enhancedLogout } from "@/utils/enhanced-auth";
import Logo from "./navigation/Logo";
import NavItems from "./navigation/NavItems";
import UserActions from "./navigation/UserActions";
import MobileMenu from "./navigation/MobileMenu";

const DashboardNavigation = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser, isLoading } = useCurrentUser();

  // Initialize notification toasts
  useNotificationToasts();

  // Use app_role for new system, fallback to legacy role for backwards compatibility
  const userAppRole = currentUser?.app_role || (currentUser?.role === 'admin' ? 'account_admin' : 'member');
  
  // Enable links for admin/super admin users
  const isSuperAdmin = userAppRole === 'super_admin';
  const isAdmin = userAppRole === 'account_admin' || currentUser?.role === 'admin';
  const canAccessUsers = isSuperAdmin;
  const canAccessDealerships = isSuperAdmin;

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    ...(canAccessDealerships ? [{ name: "Dealerships", href: "/dealerships" }] : []),
    ...(canAccessUsers ? [{ name: "Users", href: "/users" }] : []),
    { name: "Buyers", href: "/buyers" },
    { name: "Market View", href: "/marketplace" },
  ];

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .is('read_at', null);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  }, []);

  const subscribeToNotifications = useCallback(() => {
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
  }, [fetchUnreadCount]);

  useEffect(() => {
    fetchUnreadCount();
    const unsubscribe = subscribeToNotifications();
    return () => {
      unsubscribe();
    };
  }, [fetchUnreadCount, subscribeToNotifications]);

  const handleLogout = async () => {
    try {
      await enhancedLogout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force navigation even if logout fails
      navigate('/');
    }
  };

  return (
    <nav className="fixed w-full bg-white border-b border-slate-100 z-50">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-12">
            <Logo />
            <NavItems
              items={navItems}
              className="hidden md:flex items-center gap-8"
            />
          </div>

          <div className="flex items-center gap-4">
            <UserActions
              unreadCount={unreadCount}
              onLogout={handleLogout}
              className="hidden md:flex"
              currentUser={currentUser}
            />
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 focus:outline-none transition-colors"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
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
        currentUser={currentUser}
      />
    </nav>
  );
};

export default DashboardNavigation;
