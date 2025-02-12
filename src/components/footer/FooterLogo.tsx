
import { Link } from "react-router-dom";

const FooterLogo = () => {
  return (
    <div className="md:col-span-1">
      <Link to="/" className="inline-block mb-6">
        <img 
          src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
          alt="BuyBidHQ Logo" 
          className="h-9 w-auto brightness-0 invert"
        />
      </Link>
      <p className="text-gray-400 mb-6">
        © {new Date().getFullYear()} BuyBidHQ™. All rights reserved.
      </p>
    </div>
  );
};

export default FooterLogo;
