
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, Gauge, ArrowRight } from "lucide-react";

interface VinEntryFormProps {
  vin: string;
  mileage: string;
  isLoading: boolean;
  isSubmitting: boolean;
  onVinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMileageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const VinEntryForm = ({
  vin,
  mileage,
  isLoading,
  isSubmitting,
  onVinChange,
  onMileageChange,
  onSubmit
}: VinEntryFormProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-2">Enter Vehicle VIN</h2>
      <p className="text-gray-500 mb-4">
        Please enter the 17-character VIN to fetch vehicle details
      </p>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <Car className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            value={vin}
            onChange={onVinChange}
            className="pl-8 py-2 h-9 uppercase text-sm"
            placeholder="e.g. 1C4HJWDG3JL915998"
            maxLength={17}
          />
        </div>
        
        <div className="relative">
          <Gauge className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            value={mileage}
            onChange={onMileageChange}
            className="pl-8 py-2 h-9 text-sm"
            placeholder="Vehicle Mileage"
            inputMode="numeric"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-9 bg-blue-400 hover:bg-blue-500 text-white text-sm"
          disabled={isLoading || isSubmitting || vin.length !== 17}
          size="sm"
        >
          {isLoading || isSubmitting ? (
            "Loading..."
          ) : (
            <>
              Fetch Vehicle Details
              <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
      
      <p className="text-gray-500 text-center mt-4 text-xs">
        VIN can be found on the vehicle's dashboard or driver-side door jamb
      </p>
    </>
  );
};

export default VinEntryForm;
