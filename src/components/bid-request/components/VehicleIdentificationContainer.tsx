import React from "react";
import { VehicleData, vinService } from "@/services/vinService";
import VehicleIdentification from "./VehicleIdentification";
import { TrimOption } from "../types";
import { logger } from '@/utils/logger';

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
    logger.debug('VehicleIdentificationContainer: Received vehicle data:', data);
    logger.debug('VehicleIdentificationContainer: onBatchChange available:', !!onBatchChange);
    logger.debug('VehicleIdentificationContainer: data.availableTrims:', data.availableTrims);
    logger.debug('VehicleIdentificationContainer: data.model:', data.model);
    logger.debug('VehicleIdentificationContainer: data.displayTrim:', data.displayTrim);
    logger.debug('VehicleIdentificationContainer: data.selectedTrim:', data.selectedTrim);
    
    // 🔍 FIX: Ensure displayTrim is set from selectedTrim if it exists
    // This ensures the dropdown pre-selects the matched trim after VIN decode
    if (data.selectedTrim && !data.displayTrim) {
      data.displayTrim = vinService.getDisplayTrim(data.selectedTrim);
      logger.debug('VehicleIdentificationContainer: Set displayTrim from selectedTrim:', data.displayTrim);
    }
    
    // Also ensure trim name is set from selectedTrim if missing
    if (data.selectedTrim && !data.trim) {
      data.trim = data.selectedTrim.name;
      logger.debug('VehicleIdentificationContainer: Set trim from selectedTrim.name:', data.trim);
    }
    
    if (!onBatchChange) {
      logger.debug('VehicleIdentificationContainer: Using fallback onChange method');
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
    
    logger.debug('VehicleIdentificationContainer: Applying batch changes:', changes);
    logger.debug('VehicleIdentificationContainer: displayTrim in changes:', changes.find(c => c.name === 'displayTrim'));
    onBatchChange(changes);
  };

  return (
    <VehicleIdentification
      formData={formData}
      errors={errors}
      onChange={onChange}
      onVehicleDataFetched={handleVehicleDataFetched}
      onSelectChange={onSelectChange}
      onBatchChange={onBatchChange}
      showValidation={showValidation}
    />
  );
};

export default VehicleIdentificationContainer;