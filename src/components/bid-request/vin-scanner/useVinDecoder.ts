
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TrimOption } from "../types";

interface VehicleData {
  year: string;
  make: string;
  model: string;
  trim: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  availableTrims: TrimOption[];
}

export function useVinDecoder(onVehicleDataFetched?: (data: VehicleData) => void) {
  const [isLoading, setIsLoading] = useState(false);

  const decodeVin = async (vin: string) => {
    if (vin.length !== 17) {
      toast.error("Please enter a valid 17-character VIN");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Calling decode-vin function with VIN:', vin);
      
      const { data: response, error } = await supabase.functions.invoke('decode-vin', {
        body: JSON.stringify({ vin })
      });

      console.log('Raw response from decode-vin:', response);

      if (error) {
        console.error('Supabase function error:', error);
        toast.error(error.message || "Failed to decode VIN. Please try again.");
        return;
      }

      if (!response) {
        console.error('No data received from VIN decoder');
        toast.error("No data received from VIN decoder");
        return;
      }

      if (response.error) {
        console.error('VIN decoder error:', response.error);
        toast.error(response.error || "Failed to decode VIN");
        return;
      }

      // Ensure trims are properly processed
      const processedTrims = response.availableTrims?.map((trim: any) => ({
        name: trim.name || '',
        description: trim.description || '',
        specs: {
          engine: trim.specs?.engine || '',
          transmission: trim.specs?.transmission || '',
          drivetrain: trim.specs?.drivetrain || ''
        }
      })) || [];

      console.log('Processed trims:', processedTrims);

      const vehicleData: VehicleData = {
        year: response.year || "",
        make: response.make || "",
        model: response.model || "",
        trim: response.trim || "",
        engineCylinders: response.engineCylinders || "",
        transmission: response.transmission || "",
        drivetrain: response.drivetrain || "",
        availableTrims: processedTrims
      };

      console.log('Final vehicle data:', vehicleData);
      console.log('Available trims:', vehicleData.availableTrims);

      onVehicleDataFetched?.(vehicleData);
      toast.success("Vehicle information retrieved successfully");
    } catch (error: any) {
      console.error('Error decoding VIN:', error);
      toast.error(error.message || "Failed to decode VIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    decodeVin
  };
}
