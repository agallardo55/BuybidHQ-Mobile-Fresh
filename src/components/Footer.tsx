
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const isAdminPage = ["/dashboard", "/buyers", "/account", "/create-bid-request"].includes(location.pathname);
  const isBidResponsePage = location.pathname === "/bid-response";

  if (isAdminPage) {
    return (
      <footer className="bg-white py-8 mt-auto border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
                alt="BuyBidHQ Logo" 
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-500 mt-4 sm:mt-0">
              © {new Date().getFullYear()} BuyBidHQ™. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  if (isBidResponsePage) {
    return (
      <footer className="bg-primary text-white py-12 mt-auto">
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
  }

  return (
    <footer className="bg-primary text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center">
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

          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/features" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-gray-400 hover:text-white transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="text-gray-400 hover:text-white transition-colors">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-gray-400 hover:text-white transition-colors">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
