
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Bell, Menu, X, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";
import { hasRequiredRole } from "@/config/features";
import { supabase } from "@/integrations/supabase/client";
import { ComingSoonBadge } from "@/components/ui/coming-soon-badge";

const DashboardNavigation = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { currentUser, isLoading } = useCurrentUser();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Buyers", href: "/buyers" },
    ...((!isLoading && currentUser?.role === 'dealer') ? [{ name: "Users", href: "/users" }] : []),
    { name: "Marketplace", href: "#" },
  ];

  const handleNotificationsToggle = () => {
    toast({
      title: "Notifications",
      description: (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="font-medium text-gray-900">New Bid Request</p>
            <p className="text-sm text-gray-500 mt-1">A new bid request has been submitted for a 2024 Toyota Camry.</p>
            <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="font-medium text-gray-900">Bid Accepted</p>
            <p className="text-sm text-gray-500 mt-1">Your bid for the 2023 Honda Civic has been accepted.</p>
            <p className="text-xs text-gray-400 mt-2">1 day ago</p>
          </div>
        </div>
      ),
    });
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
              <button 
                className="relative p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
                aria-label="Notifications"
                onClick={handleNotificationsToggle}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
              </button>
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
            <div className="flex items-center space-x-4 px-3 py-2">
              <Link 
                to="/account"
                className="p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
                aria-label="Account"
                onClick={() => setIsOpen(false)}
              >
                <UserRound className="h-5 w-5" />
              </Link>
              <button 
                className="relative p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
                aria-label="Notifications"
                onClick={() => {
                  handleNotificationsToggle();
                  setIsOpen(false);
                }}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
              </button>
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
