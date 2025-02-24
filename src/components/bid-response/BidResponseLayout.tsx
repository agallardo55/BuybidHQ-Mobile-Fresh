
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface BidResponseLayoutProps {
  children: React.ReactNode;
}

const BidResponseLayout = ({ children }: BidResponseLayoutProps) => {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'BuyBid Vehicle Bid Request',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white shadow-sm py-4">
        <div className="max-w-2xl mx-auto px-4 flex justify-between items-center">
          <img src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" alt="BuyBid Logo" className="h-8" />
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleShare}
              className="hover:bg-gray-100"
            >
              <Share2 className="h-5 w-5 text-gray-600" />
            </Button>
            <Link to="/signup">
              <Button variant="default" className="bg-custom-blue hover:bg-custom-blue/90">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
};

export default BidResponseLayout;
