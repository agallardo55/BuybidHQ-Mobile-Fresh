
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Footer = () => {
  const location = useLocation();
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  const isAdminPage = ["/dashboard", "/buyers", "/account", "/create-bid-request"].includes(location.pathname);
  const isBidResponsePage = location.pathname === "/bid-response";

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      window.location.href = '/#contact';
    } else {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isAdminPage) {
    return (
      <footer className="bg-white py-6 mt-auto border-t">
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
  }

  return (
    <>
      <footer className="bg-primary text-white py-9 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4 md:col-span-1">
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

            <div className="md:col-start-2 md:col-span-2">
              <div className="grid grid-cols-2 gap-8 justify-items-end">
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-right">Product</h3>
                  <ul className="space-y-2 text-right">
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
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4 text-right">Support</h3>
                  <ul className="space-y-2 text-right">
                    <li>
                      <button
                        onClick={handleContactClick}
                        className="text-gray-400 hover:text-white transition-colors text-right w-full"
                      >
                        Contact Us
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setShowTerms(true)}
                        className="text-gray-400 hover:text-white transition-colors text-right w-full"
                      >
                        Terms of Service
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setShowPrivacy(true)}
                        className="text-gray-400 hover:text-white transition-colors text-right w-full"
                      >
                        Privacy Policy
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <Dialog open={showTerms} onOpenChange={() => setShowTerms(false)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
              <p>
                By accessing and using BuyBidHQ™, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>

              <h3 className="text-lg font-semibold">2. Use of Service</h3>
              <p>
                BuyBidHQ™ provides a platform for vehicle bidding and transactions. Users must provide accurate information and maintain the confidentiality of their account credentials.
              </p>

              <h3 className="text-lg font-semibold">3. User Obligations</h3>
              <p>
                Users agree to use the service in compliance with all applicable laws and regulations. Any fraudulent activity or misuse of the platform is strictly prohibited.
              </p>

              <h3 className="text-lg font-semibold">4. Limitation of Liability</h3>
              <p>
                BuyBidHQ™ is not liable for any indirect, incidental, or consequential damages arising from your use of the service.
              </p>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrivacy} onOpenChange={() => setShowPrivacy(false)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">1. Information Collection</h3>
              <p>
                We collect information that you provide directly to us, including personal information such as your name, email address, and business details.
              </p>

              <h3 className="text-lg font-semibold">2. Use of Information</h3>
              <p>
                We use the information we collect to provide, maintain, and improve our services, and to communicate with you about your account and updates.
              </p>

              <h3 className="text-lg font-semibold">3. Data Security</h3>
              <p>
                We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.
              </p>

              <h3 className="text-lg font-semibold">4. Your Rights</h3>
              <p>
                You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.
              </p>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Footer;
