import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <DashboardNavigation />
      
      <div className="flex-grow">
        {children}
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardLayout;