
import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";

const BidRequestNavigation = () => {
  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
                alt="BuyBidHQ Logo" 
                className="h-8 w-auto"
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
            <button 
              className="text-gray-700 hover:text-accent transition-colors"
            >
              Marketplace
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <UserRound className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">Account</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BidRequestNavigation;
