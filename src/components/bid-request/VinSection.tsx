
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VinSectionProps {
  vin: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  onVehicleDataFetched?: (data: {
    year: string;
    make: string;
    model: string;
    trim: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
  }) => void;
}

const VinSection = ({ vin, onChange, error, onVehicleDataFetched }: VinSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDecodeVin = async () => {
    if (vin.length !== 17) {
      toast.error("Please enter a valid 17-character VIN");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('decode-vin', {
        body: { vin }
      });

      if (functionError) throw functionError;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // The data structure is now directly what we expect from the edge function
      const vehicleData = {
        year: data.year || "",
        make: data.make || "",
        model: data.model || "",
        trim: data.trim || "",
        engineCylinders: data.engineCylinders || "",
        transmission: data.transmission || "",
        drivetrain: data.drivetrain || "",
      };

      onVehicleDataFetched?.(vehicleData);
      toast.success("Vehicle information retrieved successfully");
    } catch (error) {
      console.error('Error decoding VIN:', error);
      toast.error("Failed to decode VIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
        VIN <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        <Input
          id="vin"
          name="vin"
          type="text"
          value={vin}
          onChange={onChange}
          required
          placeholder="1HGCM82633A123456"
          className={error ? "border-red-500" : ""}
          maxLength={17}
        />
        <Button 
          type="button"
          className="bg-custom-blue hover:bg-custom-blue/90 px-6"
          onClick={handleDecodeVin}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Go"}
        </Button>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default VinSection;
