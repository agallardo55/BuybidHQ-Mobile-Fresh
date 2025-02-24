
import { useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import Footer from "@/components/Footer";
import { BidRequestScenario } from "@/components/sms-test/BidRequestScenario";
import { BidResponseScenario } from "@/components/sms-test/BidResponseScenario";
import { ErrorScenarios } from "@/components/sms-test/ErrorScenarios";
import { PhoneNumberInput } from "@/components/sms-test/PhoneNumberInput";

const SmsTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const cleanPhoneNumber = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNavigation />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">SMS Testing Dashboard</h1>
          
          <div className="space-y-6">
            <PhoneNumberInput 
              phoneNumber={phoneNumber} 
              setPhoneNumber={setPhoneNumber} 
            />

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Test Scenarios</h2>
              
              <BidRequestScenario 
                phoneNumber={cleanPhoneNumber(phoneNumber)}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />

              <BidResponseScenario 
                phoneNumber={cleanPhoneNumber(phoneNumber)}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />

              <ErrorScenarios 
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SmsTest;
