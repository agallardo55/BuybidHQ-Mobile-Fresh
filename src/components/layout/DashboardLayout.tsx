import { useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNavigation 
        onNotificationPanelChange={setIsNotificationPanelOpen}
      />
      
      <div 
        className={`flex-grow transition-all duration-300 ease-in-out ${
          !isMobile && isNotificationPanelOpen ? 'pr-80' : ''
        }`}
      >
        {children}
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardLayout;