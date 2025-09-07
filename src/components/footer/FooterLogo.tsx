
import { Link } from "react-router-dom";

const FooterLogo = () => {
  return (
    <div className="md:col-span-1">
      <Link to="/" className="inline-block mb-6">
        <span className="text-lg font-semibold text-white">BuybidHQ</span>
      </Link>
      <p className="text-gray-400 mb-6">
        © {new Date().getFullYear()} BuybidHQ™. All rights reserved.
      </p>
    </div>
  );
};

export default FooterLogo;
