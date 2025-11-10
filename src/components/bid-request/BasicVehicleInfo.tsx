import React, { useState } from "react";
import VinSection from "./VinSection";
import VehicleSummaryDisplay from "./components/VehicleSummaryDisplay"; // ✅ ADD THIS IMPORT
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
  
  // Handle VIN decoding - preserves all specs (engineCylinders, transmission, drivetrain)
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
    // Include all string values (year, make, model, trim, displayTrim, engineCylinders, transmission, drivetrain)
    // and availableTrims array
    const changes = Object.entries(data)
      .filter(([name, value]) => {
        // Include string values (including specs) and availableTrims array
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

  // Cache specs by trim to prevent duplicate API calls
  const [specsCache, setSpecsCache] = useState<Record<string, { engine: string; transmission: string; drivetrain: string }>>({});
  const [loadingSpecs, setLoadingSpecs] = useState(false);

  // Handle trim change with auto-population and fallback priority
  const handleTrimChange = async (value: string) => {
    console.log('🔍 TRIM DEBUG:', {
      receivedValue: value,
      availableTrims: formData.availableTrims?.length,
      displayTrims: formData.availableTrims?.map(t => vinService.getDisplayTrim(t)),
      currentDisplayTrim: formData.displayTrim
    });
    
    // Find the selected trim to auto-populate related fields
    const selectedTrim = formData.availableTrims.find(trim => 
      vinService.getDisplayTrim(trim) === value
    );

    if (!selectedTrim) {
      // Clear specs if trim not found
      onSelectChange('', 'engineCylinders');
      onSelectChange('', 'transmission');
      onSelectChange('', 'drivetrain');
      return;
    }

    // Store both display and database values
    const cleanedTrimValue = vinService.getDisplayTrim(selectedTrim);
    onSelectChange(selectedTrim.name, 'trim'); // For database - use actual trim name
    onSelectChange(cleanedTrimValue, 'displayTrim'); // For dropdown display

    // PRIORITY 1: Check if specs already in trim object (from VIN decode or trim fetch)
    if (selectedTrim.specs?.engine && selectedTrim.specs?.transmission) {
      console.log('Using specs from trim object:', selectedTrim.specs);
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
      return; // Exit early - specs found in trim object
    }

    // PRIORITY 2: Check cache
    const cacheKey = `${formData.year}-${formData.make}-${formData.model}-${selectedTrim.name}`;
    if (specsCache[cacheKey]) {
      console.log('Using specs from cache:', specsCache[cacheKey]);
      const cachedSpecs = specsCache[cacheKey];
      if (cachedSpecs.engine) {
        onSelectChange(cachedSpecs.engine, 'engineCylinders');
      }
      if (cachedSpecs.transmission) {
        onSelectChange(cachedSpecs.transmission, 'transmission');
      }
      if (cachedSpecs.drivetrain && !formData.drivetrain) {
        onSelectChange(cachedSpecs.drivetrain, 'drivetrain');
      }
      return; // Exit early - specs from cache
    }

    // PRIORITY 3: Fetch specs via API (only if missing)
    if (!selectedTrim.specs?.engine || !selectedTrim.specs?.transmission) {
      setLoadingSpecs(true);
      try {
        console.log('Fetching specs for trim:', selectedTrim.name);
        const specs = await vinService.fetchSpecsByYearMakeModelTrim(
          formData.year, formData.make, formData.model, selectedTrim.name
        );
        
        if (specs && specs.engine && specs.transmission) {
          // Cache the specs
          setSpecsCache(prev => ({ ...prev, [cacheKey]: specs }));
          
          // Update formData with fetched specs
          if (specs.engine) {
            onSelectChange(specs.engine, 'engineCylinders');
          }
          if (specs.transmission) {
            onSelectChange(specs.transmission, 'transmission');
          }
          if (specs.drivetrain && !formData.drivetrain) {
            onSelectChange(specs.drivetrain, 'drivetrain');
          }
        } else {
          // PRIORITY 4: Show "Not Available" if specs cannot be found
          console.warn('Specs not available for trim:', selectedTrim.name);
          onSelectChange('Not Available', 'engineCylinders');
          onSelectChange('Not Available', 'transmission');
          if (!formData.drivetrain) {
            onSelectChange('Not Available', 'drivetrain');
          }
        }
      } catch (error) {
        console.error('Error fetching specs:', error);
        // Show "Not Available" on error
        onSelectChange('Not Available', 'engineCylinders');
        onSelectChange('Not Available', 'transmission');
        if (!formData.drivetrain) {
          onSelectChange('Not Available', 'drivetrain');
        }
      } finally {
        setLoadingSpecs(false);
      }
    }
  };

  // Handle trims update from manual selection
  const handleTrimsUpdate = (trims: TrimOption[]) => {
    if (onBatchChange) {
      onBatchChange([{ name: 'availableTrims', value: trims }]);
    }
  };

  // ✅ ADD THIS: Check if vehicle is fully decoded AND trim is selected
  const isFullyDecoded = !!(
    formData.year && 
    formData.make && 
    formData.model && 
    formData.availableTrims?.length > 0 && 
    formData.displayTrim
  );

  return (
    <div className="space-y-4">
      {/* Show summary view when fully decoded and trim selected - ABOVE VinSection */}
      {isFullyDecoded && (
        <VehicleSummaryDisplay 
          year={formData.year}
          make={formData.make}
          model={formData.model}
          trim={formData.displayTrim}
          exteriorColor={formData.exteriorColor || '-'}
          interiorColor={formData.interiorColor || '-'}
          engine={formData.engineCylinders}
          transmission={formData.transmission || '-'}
          drivetrain={formData.drivetrain}
          style={formData.displayTrim}
          vin={formData.vin}
        />
      )}
      
      {/* VIN Input Section - Always show */}
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
        hideDropdowns={isFullyDecoded}
      />
    </div>
  );
};

export default BasicVehicleInfo;