
import React from "react";
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
    availableTrims: TrimOption[];
  };
  errors: {
    year?: string;
    make?: string;
    model?: string;
    trim?: string;
    vin?: string;
  };
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
  const handleVehicleDataFetched = (data: {
    year: string;
    make: string;
    model: string;
    trim: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
    availableTrims: TrimOption[];
  }) => {
    console.log('Vehicle data received in VehicleIdentificationContainer:', data);
    
    // Always use batch changes to properly handle complex data
    const changes = Object.entries(data).map(([name, value]) => ({
      name,
      value
    }));
    
    console.log('Sending batch changes:', changes);
    
    if (onBatchChange) {
      onBatchChange(changes);
    } else {
      // Fallback for simple string values if batch change isn't available
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          const syntheticEvent = {
            target: {
              name: key,
              value: value
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      });
    }
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
