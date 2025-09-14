
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ErrorScenariosProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const ErrorScenarios = ({ isLoading, setIsLoading }: ErrorScenariosProps) => {
  const testInvalidNumber = async () => {
    setIsLoading(true);
    try {
    const { data, error } = await supabase.functions.invoke('send-twilio-sms', {
        body: {
          type: "bid_request",
          phoneNumber: "5005550001", // Twilio test number for failure
          vehicleDetails: {
            year: "2024",
            make: "Toyota",
            model: "Camry"
          },
          bidRequestUrl: "https://buybidhq.com/bid/test123"
        }
      });

      if (error) throw error;
      console.log("Invalid number test response:", data);
    } catch (error) {
      console.error("Error testing invalid number:", error);
      toast.success("Invalid number test completed successfully");
    } finally {
      setIsLoading(false);
    }
  };

  const testUnroutableNumber = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-twilio-sms', {
        body: {
          type: "bid_request",
          phoneNumber: "5005550009", // Twilio test number for unroutable
          vehicleDetails: {
            year: "2024",
            make: "Toyota",
            model: "Camry"
          },
          bidRequestUrl: "https://buybidhq.com/bid/test123"
        }
      });

      if (error) throw error;
      console.log("Unroutable number test response:", data);
    } catch (error) {
      console.error("Error testing unroutable number:", error);
      toast.success("Unroutable number test completed successfully");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Scenario 3: Invalid Number Test</h3>
          <p className="text-sm text-gray-600 mb-3">
            Tests handling of invalid phone numbers using Twilio's test number
          </p>
          <Button
            onClick={testInvalidNumber}
            disabled={isLoading}
            variant="custom-blue"
          >
            Test Invalid Number
          </Button>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Scenario 4: Unroutable Number Test</h3>
          <p className="text-sm text-gray-600 mb-3">
            Tests handling of unroutable phone numbers using Twilio's test number
          </p>
          <Button
            onClick={testUnroutableNumber}
            disabled={isLoading}
            variant="custom-blue"
          >
            Test Unroutable Number
          </Button>
        </div>
      </div>
    </>
  );
};
