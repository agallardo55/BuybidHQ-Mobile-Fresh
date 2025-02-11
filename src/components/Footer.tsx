
import { useLocation } from "react-router-dom";
import { useState } from "react";
import FooterLogo from "./footer/FooterLogo";
import FooterProduct from "./footer/FooterProduct";
import FooterSupport from "./footer/FooterSupport";
import FooterContact from "./footer/FooterContact";
import AdminFooter from "./footer/AdminFooter";
import BidResponseFooter from "./footer/BidResponseFooter";
import TermsDialog from "./footer/TermsDialog";
import PrivacyDialog from "./footer/PrivacyDialog";

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

  const handleSectionScroll = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isAdminPage) {
    return <AdminFooter />;
  }

  if (isBidResponsePage) {
    return <BidResponseFooter />;
  }

  return (
    <>
      <footer className="bg-primary text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <FooterLogo />
            <FooterProduct onSectionScroll={handleSectionScroll} />
            <FooterSupport 
              onContactClick={handleContactClick}
              onShowTerms={() => setShowTerms(true)}
              onShowPrivacy={() => setShowPrivacy(true)}
            />
            <FooterContact />
          </div>
        </div>
      </footer>

      <TermsDialog 
        open={showTerms} 
        onOpenChange={setShowTerms} 
      />
      
      <PrivacyDialog 
        open={showPrivacy} 
        onOpenChange={setShowPrivacy} 
      />
    </>
  );
};

export default Footer;
