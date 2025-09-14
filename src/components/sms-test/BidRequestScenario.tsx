
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BidRequestScenarioProps {
  phoneNumber: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const BidRequestScenario = ({ phoneNumber, isLoading, setIsLoading }: BidRequestScenarioProps) => {
  const testBidRequest = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Sending request with data:", {
        type: "bid_request",
        phoneNumber,
        senderName: "John Smith",
        bidRequestUrl: "https://buybidhq.com/bid/test123"
      });

      const { data, error } = await supabase.functions.invoke('send-twilio-sms', {
        body: {
          type: "bid_request",
          phoneNumber,
          senderName: "John Smith",
          bidRequestUrl: "https://buybidhq.com/bid/test123"
        }
      });

      if (error) {
        console.error("Function invocation error:", error);
        throw error;
      }

      if (data?.error) {
        console.error("Edge function error:", data.error);
        throw new Error(data.error);
      }

      toast.success("Bid request SMS sent successfully!");
      console.log("SMS Response:", data);
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      toast.error(error.message || "Failed to send bid request SMS");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Scenario 1: Bid Request Notification</h3>
        <p className="text-sm text-gray-600 mb-3">
          Tests sending a new bid request notification SMS from John Smith
        </p>
        <Button
          onClick={testBidRequest}
          disabled={isLoading || phoneNumber.length !== 10}
          variant="custom-blue"
        >
          Test Bid Request SMS
        </Button>
      </div>
    </div>
  );
};
