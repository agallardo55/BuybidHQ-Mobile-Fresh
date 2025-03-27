
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, Gauge, ArrowRight } from "lucide-react";
import { useVinDecoder } from "../vin-scanner/useVinDecoder";
import { toast } from "sonner";

interface QuickPostFormProps {
  onClose: () => void;
}

const QuickPostForm = ({ onClose }: QuickPostFormProps) => {
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { decodeVin, isLoading } = useVinDecoder((vehicleData) => {
    // This would handle the vehicle data once fetched
    console.log("Vehicle data fetched:", vehicleData);
    toast.success("Vehicle details retrieved successfully");
    
    // Here you would typically navigate to a more detailed form
    // with the pre-filled vehicle data
    setIsSubmitting(false);
    onClose();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vin || vin.length !== 17) {
      toast.error("Please enter a valid 17-character VIN");
      return;
    }
    
    setIsSubmitting(true);
    decodeVin(vin);
  };

  // Format and validate VIN input
  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove any non-alphanumeric characters
    const formattedVin = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Limit to 17 characters
    const limitedVin = formattedVin.slice(0, 17);
    
    setVin(limitedVin);
  };

  // Handle mileage input to only accept numbers
  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Format with commas for thousands
    let formattedValue = numericValue;
    if (numericValue) {
      formattedValue = Number(numericValue).toLocaleString('en-US', {
        maximumFractionDigits: 0,
        useGrouping: true
      });
    }
    
    setMileage(formattedValue);
  };

  return (
    <div className="flex flex-col py-4 px-1">
      <h2 className="text-2xl font-semibold mb-2">Enter Vehicle VIN</h2>
      <p className="text-gray-500 mb-6">
        Please enter the 17-character VIN to fetch vehicle details
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input 
            value={vin}
            onChange={handleVinChange}
            className="pl-11 py-6 uppercase"
            placeholder="e.g. 1C4HJWDG3JL915998"
            maxLength={17}
          />
        </div>
        
        <div className="relative">
          <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input 
            value={mileage}
            onChange={handleMileageChange}
            className="pl-11 py-6"
            placeholder="Vehicle Mileage"
            inputMode="numeric"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full py-6 bg-blue-400 hover:bg-blue-500 text-white"
          disabled={isLoading || isSubmitting || vin.length !== 17}
        >
          {isLoading || isSubmitting ? (
            "Loading..."
          ) : (
            <>
              Fetch Vehicle Details
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
      
      <p className="text-gray-500 text-center mt-6 text-sm">
        VIN can be found on the vehicle's dashboard or driver-side door jamb
      </p>
    </div>
  );
};

export default QuickPostForm;
