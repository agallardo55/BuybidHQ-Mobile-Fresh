
import { Link } from "react-router-dom";

const BidResponseFooter = () => {
  return (
    <footer className="bg-primary text-white py-9 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
              alt="BuyBidHQ Logo" 
              className="h-8 w-auto brightness-0 invert"
            />
          </Link>
          <p className="text-sm text-gray-400 mt-4 sm:mt-0">
            © {new Date().getFullYear()} BuyBidHQ™. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default BidResponseFooter;
