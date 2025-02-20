
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";
import { usePhoneFormat } from "@/hooks/signup/usePhoneFormat";

const SmsTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const { formatPhoneNumber } = usePhoneFormat();

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const cleanPhoneNumber = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const testBidRequest = async () => {
    const cleanedPhone = cleanPhoneNumber(phoneNumber);
    if (cleanedPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-bid-sms', {
        body: {
          type: "bid_request",
          phoneNumber: cleanedPhone,
          vehicleDetails: {
            year: "2024",
            make: "Toyota",
            model: "Camry"
          },
          bidRequestUrl: "https://buybidhq.com/bid/test123"
        }
      });

      if (error) throw error;
      
      toast.success("Bid request SMS sent successfully!");
      console.log("SMS Response:", data);
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error("Failed to send bid request SMS");
    } finally {
      setIsLoading(false);
    }
  };

  const testBidResponse = async () => {
    const cleanedPhone = cleanPhoneNumber(phoneNumber);
    if (cleanedPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-bid-sms', {
        body: {
          type: "bid_response",
          phoneNumber: cleanedPhone,
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

  const testInvalidNumber = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-bid-sms', {
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
      const { data, error } = await supabase.functions.invoke('send-bid-sms', {
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNavigation />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">SMS Testing Dashboard</h1>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Test Phone Number
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="(500) 555-0000"
                className="mb-4"
              />
              <div className="text-sm text-gray-500 space-y-2 mb-4">
                <p>For testing, use these Twilio test numbers:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><code>+15005550000</code> - Simulates successful message</li>
                  <li><code>+15005550001</code> - Simulates failed message</li>
                  <li><code>+15005550009</code> - Simulates unroutable message</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Test Scenarios</h2>
              
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Scenario 1: Bid Request Notification</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Tests sending a new bid request notification SMS for a 2024 Toyota Camry
                  </p>
                  <Button
                    onClick={testBidRequest}
                    disabled={isLoading || cleanPhoneNumber(phoneNumber).length !== 10}
                    variant="custom-blue"
                  >
                    Test Bid Request SMS
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Scenario 2: Bid Response Notification</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Tests sending a bid response notification SMS with a $25,000 offer
                  </p>
                  <Button
                    onClick={testBidResponse}
                    disabled={isLoading || cleanPhoneNumber(phoneNumber).length !== 10}
                    variant="custom-blue"
                  >
                    Test Bid Response SMS
                  </Button>
                </div>
              </div>

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
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SmsTest;

