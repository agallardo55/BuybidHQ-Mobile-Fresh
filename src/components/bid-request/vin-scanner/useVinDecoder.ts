
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TrimOption } from "../types";
import { getDisplayValue } from "../utils/trimUtils";

interface VehicleData {
  year: string;
  make: string;
  model: string;
  trim: string;
  displayTrim: string;
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
      console.log('Response data structure:', response.data);
      console.log('Available trims in response:', response.data?.availableTrims);
      console.log('TEST: Code execution reached line 38');

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

      // Ensure trims are properly processed and filtered
      let processedTrims = [];
      
      if (response.data?.availableTrims && Array.isArray(response.data.availableTrims)) {
        processedTrims = response.data.availableTrims
          .filter((trim: any) => trim && trim.name) // Filter out any null or invalid trims
          .map((trim: any) => ({
            name: trim.name.trim(),
            description: trim.description?.trim() || '',
            specs: {
              engine: trim.specs?.engine?.trim() || '',
              transmission: trim.specs?.transmission?.trim() || '',
              drivetrain: trim.specs?.drivetrain?.trim() || ''
            }
          }));
      } else {
        // If no availableTrims provided, create a single trim option from the basic trim data
        const trimName = response.data?.trim || '';
        console.log('No availableTrims found, trimName from response:', trimName);
        console.log('Response data trims array:', response.data?.trims);
        console.log('DEBUG: Updated code version - timestamp:', new Date().toISOString());
        
        // Always create a trim if we have a trim name or trims array
        console.log('Checking trim creation conditions:');
        console.log('- trimName:', trimName);
        console.log('- response.data?.trims exists:', !!response.data?.trims);
        console.log('- response.data?.trims length:', response.data?.trims?.length);
        
        if (trimName || (response.data?.trims && response.data.trims.length > 0)) {
          console.log('Creating single trim from available data');
          
          // Try to extract specs from the trims array if available
          let engineSpec = '';
          let transmissionSpec = '';
          let drivetrainSpec = '';
          let finalTrimName = trimName;
          let finalDescription = trimName;
          
          if (response.data?.trims && response.data.trims.length > 0) {
            const trimData = response.data.trims[0];
            finalTrimName = trimData.name || trimName;
            finalDescription = trimData.description || trimName;
            
            console.log('Trim description to parse:', finalDescription);
            
            // Parse engine info from description like "2.0L 4cyl Turbo"
            const engineMatch = finalDescription.match(/\(([^)]+)\)/);
            if (engineMatch) {
              const specsString = engineMatch[1];
              console.log('Specs string:', specsString);
              
              // Extract engine (e.g., "2.0L 4cyl Turbo")
              const engineMatch2 = specsString.match(/([\d.]+L\s+\d+cyl(?:\s+Turbo)?)/);
              if (engineMatch2) {
                engineSpec = engineMatch2[1];
              }
              
              // Extract drivetrain (AWD, FWD, RWD) from the full description
              const drivetrainMatch = finalDescription.match(/\b(AWD|FWD|RWD)\b/);
              if (drivetrainMatch) {
                drivetrainSpec = drivetrainMatch[1];
              }
              
              // Extract transmission (e.g., "8A" = 8-speed Automatic)
              const transmissionMatch = specsString.match(/(\d+[AM])/);
              if (transmissionMatch) {
                const transCode = transmissionMatch[1];
                const speed = transCode.replace(/[AM]/, '');
                const type = transCode.includes('A') ? 'Automatic' : 'Manual';
                transmissionSpec = `${speed}-Speed ${type}`;
              }
            }
          }
          
          processedTrims = [{
            name: finalTrimName,
            description: finalDescription,
            specs: {
              engine: engineSpec,
              transmission: transmissionSpec,
              drivetrain: drivetrainSpec
            }
          }];
          console.log('Created single trim:', processedTrims[0]);
        } else {
          console.log('No trim data available to create trim');
        }
      }

      console.log('Processed trims:', processedTrims);
      console.log('Engine cylinders from response:', response.data?.engineCylinders);
      console.log('Transmission from response:', response.data?.transmission);
      console.log('Drivetrain from response:', response.data?.drivetrain);

      // Auto-select trim if there's only one option
      let selectedTrim = (response.data?.trim || "").trim();
      if (processedTrims.length === 1 && !selectedTrim) {
        selectedTrim = processedTrims[0].name;
        console.log('Auto-selecting single trim:', selectedTrim);
      }
      
      // Also set displayTrim for single trim scenarios - use the processed display value
      let displayTrim = selectedTrim;
      if (processedTrims.length === 1) {
        displayTrim = getDisplayValue(processedTrims[0]);
      }

      const vehicleData: VehicleData = {
        year: (response.data?.year || "").toString(),
        make: (response.data?.make || "").trim(),
        model: (response.data?.model || "").trim(),
        trim: selectedTrim,
        displayTrim: displayTrim,
        engineCylinders: processedTrims[0]?.specs?.engine || "",
        transmission: processedTrims[0]?.specs?.transmission || "",
        drivetrain: processedTrims[0]?.specs?.drivetrain || "",
        availableTrims: processedTrims
      };

      console.log('Final vehicle data:', vehicleData);
      console.log('Vehicle data details:');
      console.log('- year:', vehicleData.year);
      console.log('- make:', vehicleData.make);
      console.log('- model:', vehicleData.model);
      console.log('- trim:', vehicleData.trim);
      console.log('- displayTrim:', vehicleData.displayTrim);
      console.log('- engineCylinders:', vehicleData.engineCylinders);
      console.log('- transmission:', vehicleData.transmission);
      console.log('- drivetrain:', vehicleData.drivetrain);
      console.log('- availableTrims length:', vehicleData.availableTrims.length);

      if (onVehicleDataFetched) {
        console.log('Calling onVehicleDataFetched with data:', vehicleData);
        onVehicleDataFetched(vehicleData);
      }
      
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
