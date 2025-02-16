
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Bell, Menu, X, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationList from "./notifications/NotificationList";

const DashboardNavigation = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isMobile = useIsMobile();
  const { currentUser, isLoading } = useCurrentUser();

  const canAccessUsers = currentUser?.role === 'admin' || currentUser?.role === 'dealer';

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
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

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img 
                src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
                alt="BuyBidHQ Logo" 
                className="h-8 w-auto"
              />
            </Link>
            <div className="hidden md:flex items-center space-x-8 ml-8">
              {navItems.map((item) => (
                <div key={item.name}>
                  <Link 
                    to={item.href} 
                    className="text-gray-700 hover:text-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                </div>
              ))}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="text-gray-700 hover:text-accent transition-colors cursor-pointer"
                      type="button"
                    >
                      Marketplace
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={5}>
                    <p className="font-bold whitespace-nowrap" style={{ color: '#325AE7' }}>Coming Soon!!!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/account"
                className="p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
                aria-label="Account"
              >
                <UserRound className="h-5 w-5" />
              </Link>
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="relative p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-0" align="end">
                  <NotificationList />
                </PopoverContent>
              </Popover>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
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

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-accent hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              </div>
            ))}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-accent hover:bg-gray-50"
                    type="button"
                    onClick={() => setIsOpen(false)}
                  >
                    Marketplace
                  </button>
                </TooltipTrigger>
                <TooltipContent sideOffset={5}>
                  <p className="font-bold whitespace-nowrap" style={{ color: '#325AE7' }}>Coming Soon!!!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center space-x-4 px-3 py-2">
              <Link 
                to="/account"
                className="p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
                aria-label="Account"
                onClick={() => setIsOpen(false)}
              >
                <UserRound className="h-5 w-5" />
              </Link>
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="relative p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
                    aria-label="Notifications"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-0" align="end">
                  <NotificationList />
                </PopoverContent>
              </Popover>
              <button 
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DashboardNavigation;
