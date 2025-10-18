import React from "react";
import { VehicleData } from "@/services/vinService";
import VehicleIdentification from "./VehicleIdentification";
import { TrimOption } from "../types";

interface VehicleIdentificationContainerProps {
  formData: {
    year: string;
    make: string;
    model: string;
    trim: string;
    displayTrim: string;
    vin: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
    availableTrims: TrimOption[];
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBatchChange?: (changes: Array<{ name: string; value: any }>) => void;
  onSelectChange: (value: string, name: string) => void;
  showValidation?: boolean;
}

const VehicleIdentificationContainer = ({
  formData,
  errors,
  onChange,
  onBatchChange,
  onSelectChange,
  showValidation
}: VehicleIdentificationContainerProps) => {
  const handleVehicleDataFetched = (data: VehicleData) => {
    console.log('VehicleIdentificationContainer: Received vehicle data:', data);
    console.log('VehicleIdentificationContainer: onBatchChange available:', !!onBatchChange);
    console.log('VehicleIdentificationContainer: data.availableTrims:', data.availableTrims);
    console.log('VehicleIdentificationContainer: data.model:', data.model);
    console.log('VehicleIdentificationContainer: data.displayTrim:', data.displayTrim);
    
    if (!onBatchChange) {
      console.log('VehicleIdentificationContainer: Using fallback onChange method');
      // Fallback for simple string values
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          const syntheticEvent = {
            target: { name: key, value: value }
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      });
      return;
    }

    // Convert VehicleData to batch changes format, handling arrays properly
    const changes = Object.entries(data)
      .filter(([name, value]) => {
        // Only include string values and availableTrims array
        return typeof value === 'string' || name === 'availableTrims';
      })
      .map(([name, value]) => ({ name, value }));
    
    console.log('VehicleIdentificationContainer: Applying batch changes:', changes);
    onBatchChange(changes);
  };

  return (
    <VehicleIdentification
      formData={formData}
      errors={errors}
      onChange={onChange}
      onVehicleDataFetched={handleVehicleDataFetched}
      onSelectChange={onSelectChange}
      showValidation={showValidation}
    />
  );
};

export default VehicleIdentificationContainer;