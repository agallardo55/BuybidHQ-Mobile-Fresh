
import { Link } from "react-router-dom";

const AdminFooter = () => {
  return (
    <footer className="bg-white py-6 mt-auto border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-lg font-semibold text-primary">BuybidHQ</span>
          </Link>
          <p className="text-sm text-gray-500 mt-4 sm:mt-0">
            © {new Date().getFullYear()} BuybidHQ™. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
