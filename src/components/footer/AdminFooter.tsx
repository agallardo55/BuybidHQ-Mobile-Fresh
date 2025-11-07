
const AdminFooter = () => {
  return (
    <footer className="bg-white py-3 sm:py-4 mt-auto border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-end">
          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
            © {new Date().getFullYear()} BuybidHQ™. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
