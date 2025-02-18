
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
      
      const { data, error } = await supabase.functions.invoke('decode-vin', {
        body: JSON.stringify({ vin })
      });

      console.log('Received response from decode-vin:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        toast.error(error.message || "Failed to decode VIN. Please try again.");
        return;
      }

      if (!data) {
        console.error('No data received from VIN decoder');
        toast.error("No data received from VIN decoder");
        return;
      }

      if (data.error) {
        console.error('VIN decoder error:', data.error);
        toast.error(data.error || "Failed to decode VIN");
        return;
      }

      const vehicleData: VehicleData = {
        year: data.year || "",
        make: data.make || "",
        model: data.model || "",
        trim: data.trim || "",
        engineCylinders: data.engineCylinders || "",
        transmission: data.transmission || "",
        drivetrain: data.drivetrain || "",
        availableTrims: data.availableTrims || []
      };

      console.log('Processed vehicle data:', vehicleData);
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
