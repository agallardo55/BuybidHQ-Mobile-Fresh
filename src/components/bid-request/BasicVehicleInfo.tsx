import React from "react";
import VinSection from "./VinSection";
import { TrimOption } from "./types";
import { vinService } from "@/services/vinService";

interface BasicVehicleInfoProps {
  formData: {
    year: string;
    make: string;
    model: string;
    trim: string;
    displayTrim: string;
    mileage: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
    vin: string;
    availableTrims: TrimOption[];
  };
  errors: {
    year?: string;
    make?: string;
    model?: string;
    trim?: string;
    mileage?: string;
    vin?: string;
    engineCylinders?: string;
    transmission?: string;
    drivetrain?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBatchChange?: (changes: Array<{ name: string; value: any }>) => void;
  onSelectChange: (value: string, name: string) => void;
  showValidation?: boolean;
}

const BasicVehicleInfo = ({ 
  formData, 
  errors, 
  onChange, 
  onBatchChange,
  onSelectChange,
  showValidation 
}: BasicVehicleInfoProps) => {
  
  // Handle VIN decoding
  const handleVehicleDataFetched = (data: any) => {
    console.log('BasicVehicleInfo: Received vehicle data:', data);
    
    if (!onBatchChange) {
      console.log('BasicVehicleInfo: Using fallback onChange method');
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

    // Convert VehicleData to batch changes format
    const changes = Object.entries(data)
      .filter(([name, value]) => {
        // Only include string values and availableTrims array
        return typeof value === 'string' || name === 'availableTrims';
      })
      .map(([name, value]) => ({ name, value }));
    
    console.log('BasicVehicleInfo: Applying batch changes:', changes);
    onBatchChange(changes);
  };

  // Handle dropdown changes
  const handleDropdownChange = (field: string) => (value: string) => {
    const syntheticEvent = {
      target: { name: field, value: value }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // Handle trim change with auto-population
  const handleTrimChange = (value: string) => {
    // Find the selected trim to auto-populate related fields
    const selectedTrim = formData.availableTrims.find(trim => 
      vinService.getDisplayTrim(trim) === value
    );

    if (selectedTrim) {
      // Store both display and database values
      const cleanedTrimValue = vinService.getDisplayTrim(selectedTrim);
      onSelectChange(selectedTrim.name, 'trim'); // For database - use actual trim name
      onSelectChange(cleanedTrimValue, 'displayTrim'); // For dropdown display
      
      // Update engine and other specs if available
      if (selectedTrim.specs) {
        if (selectedTrim.specs.engine) {
          onSelectChange(selectedTrim.specs.engine, 'engineCylinders');
        }
        if (selectedTrim.specs.transmission) {
          onSelectChange(selectedTrim.specs.transmission, 'transmission');
        }
        // Only update drivetrain if it's not already set (to prevent overwriting VIN decoder values)
        if (selectedTrim.specs.drivetrain && !formData.drivetrain) {
          onSelectChange(selectedTrim.specs.drivetrain, 'drivetrain');
        }
      }
    }
  };

  // Handle trims update from manual selection
  const handleTrimsUpdate = (trims: TrimOption[]) => {
    if (onBatchChange) {
      onBatchChange([{ name: 'availableTrims', value: trims }]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Single section: VIN input + Vehicle dropdowns with smart display logic */}
      <VinSection
        vin={formData.vin}
        onChange={onChange}
        error={errors.vin}
        onVehicleDataFetched={handleVehicleDataFetched}
        showValidation={showValidation}
        formData={formData}
        errors={errors}
        onYearChange={handleDropdownChange('year')}
        onMakeChange={handleDropdownChange('make')}
        onModelChange={handleDropdownChange('model')}
        onTrimChange={handleTrimChange}
        onTrimsUpdate={handleTrimsUpdate}
      />
    </div>
  );
};

export default BasicVehicleInfo;