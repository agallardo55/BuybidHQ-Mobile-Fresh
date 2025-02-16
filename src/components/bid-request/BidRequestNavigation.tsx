
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Bell, LogOut } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasRequiredRole } from "@/config/features";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BidRequestNavigation = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useCurrentUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
                alt="BuyBidHQ Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <Link 
              to="/dashboard" 
              className="text-gray-700 hover:text-accent transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/buyers" 
              className="text-gray-700 hover:text-accent transition-colors"
            >
              Buyers
            </Link>
            {(!isLoading && hasRequiredRole(currentUser?.role)) && (
              <Link 
                to="/users" 
                className="text-gray-700 hover:text-accent transition-colors"
              >
                Users
              </Link>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="text-gray-700 hover:text-accent transition-colors"
                  >
                    Marketplace
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold" style={{ color: '#325AE7' }}>Coming Soon!!!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center space-x-6">
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
        </div>
      </div>
    </nav>
  );
};

export default BidRequestNavigation;
