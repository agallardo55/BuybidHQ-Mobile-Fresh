
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, Gauge, ArrowRight, X } from "lucide-react";
import { useVinDecoder } from "../vin-scanner/useVinDecoder";
import { toast } from "sonner";
import MileageInput from "../components/MileageInput";

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

  return (
    <div className="flex flex-col py-4 px-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Quick Vehicle Post</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-gray-500 mb-6">
        Enter the vehicle VIN to fetch details
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              value={vin}
              onChange={handleVinChange}
              className="pl-11 py-5 text-base uppercase"
              placeholder="VIN (17 characters)"
              maxLength={17}
            />
            <div className="text-xs text-gray-500 mt-1 ml-2">
              {vin.length}/17 characters
            </div>
          </div>
          
          <MileageInput 
            mileage={mileage}
            onChange={(e) => setMileage(e.target.value)}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full py-6 bg-blue-500 hover:bg-blue-600 text-white"
          disabled={isLoading || isSubmitting || vin.length !== 17}
        >
          {isLoading || isSubmitting ? (
            "Processing..."
          ) : (
            <>
              Fetch Vehicle Details
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
      
      <p className="text-gray-500 text-center mt-6 text-sm">
        VIN can be found on the dashboard or driver's door jamb
      </p>
    </div>
  );
};

export default QuickPostForm;
