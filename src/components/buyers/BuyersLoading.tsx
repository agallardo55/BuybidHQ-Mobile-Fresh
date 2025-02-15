
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";

const BuyersLoading = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F6F6F7]">
      <DashboardNavigation />
      <div className="pt-24 px-4 sm:px-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            Loading buyers...
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BuyersLoading;
