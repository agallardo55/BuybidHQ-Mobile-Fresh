
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BidResponseLayoutProps {
  children: React.ReactNode;
}

const BidResponseLayout = ({ children }: BidResponseLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white shadow-sm py-4">
        <div className="max-w-2xl mx-auto px-4 flex justify-between items-center">
          <img src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" alt="BuyBid Logo" className="h-8" />
          <Link to="/signup">
            <Button variant="default" size="sm" className="bg-custom-blue hover:bg-custom-blue/90">
              Free Trial
            </Button>
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
};

export default BidResponseLayout;
