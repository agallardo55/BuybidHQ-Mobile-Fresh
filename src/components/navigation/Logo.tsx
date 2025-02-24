
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="flex-shrink-0 flex items-center">
      <img 
        src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
        alt="BuybidHQ Logo" 
        className="h-8 w-auto"
      />
    </Link>
  );
};

export default Logo;
