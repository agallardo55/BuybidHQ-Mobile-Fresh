
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          {/* Logo and Trademark */}
          <div className="space-y-4 text-center">
            <Link to="/" className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
                alt="BuyBidHQ Logo" 
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} BuyBidHQ™. <br />
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
