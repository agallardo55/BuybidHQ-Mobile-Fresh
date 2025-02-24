
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BidResponseScenarioProps {
  phoneNumber: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const BidResponseScenario = ({ phoneNumber, isLoading, setIsLoading }: BidResponseScenarioProps) => {
  const testBidResponse = async () => {
    if (phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-knock-sms', {
        body: {
          type: "bid_response",
          phoneNumber,
          vehicleDetails: {
            year: "2024",
            make: "Toyota",
            model: "Camry"
          },
          offerAmount: "25000",
          buyerName: "John Smith"
        }
      });

      if (error) throw error;
      
      toast.success("Bid response SMS sent successfully!");
      console.log("SMS Response:", data);
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error("Failed to send bid response SMS");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Scenario 2: Bid Response Notification</h3>
        <p className="text-sm text-gray-600 mb-3">
          Tests sending a bid response notification SMS with a $25,000 offer
        </p>
        <Button
          onClick={testBidResponse}
          disabled={isLoading || phoneNumber.length !== 10}
          variant="custom-blue"
        >
          Test Bid Response SMS
        </Button>
      </div>
    </div>
  );
};
