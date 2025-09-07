
const AdminFooter = () => {
  return (
    <footer className="bg-white py-6 mt-auto border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} BuybidHQ™. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
