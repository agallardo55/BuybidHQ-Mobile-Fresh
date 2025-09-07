
import { Link } from "react-router-dom";

const BidResponseFooter = () => {
  return (
    <footer className="bg-primary text-white py-9 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-lg font-semibold text-white">BuybidHQ</span>
          </Link>
          <p className="text-sm text-gray-400 mt-4 sm:mt-0">
            © {new Date().getFullYear()} BuybidHQ™. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default BidResponseFooter;
