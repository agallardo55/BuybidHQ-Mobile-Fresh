import React, { useState, useCallback } from "react";
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
    bodyStyle: string;
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
  const handleVehicleDataFetched = useCallback((data: any) => {
    console.log('BasicVehicleInfo: Received vehicle data:', data);
    console.log('BasicVehicleInfo: bodyStyle value:', data.bodyStyle);
    
    // 🔍 FIX: Ensure displayTrim is set from selectedTrim if it exists
    // This ensures the dropdown pre-selects the matched trim after VIN decode
    if (data.selectedTrim && !data.displayTrim) {
      data.displayTrim = vinService.getDisplayTrim(data.selectedTrim);
      console.log('BasicVehicleInfo: Set displayTrim from selectedTrim:', data.displayTrim);
    }
    
    // Also ensure trim name is set from selectedTrim if missing
    if (data.selectedTrim && !data.trim) {
      data.trim = data.selectedTrim.name;
      console.log('BasicVehicleInfo: Set trim from selectedTrim.name:', data.trim);
    }
    
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
    console.log('BasicVehicleInfo: displayTrim in changes:', changes.find(c => c.name === 'displayTrim'));
    console.log('BasicVehicleInfo: bodyStyle in changes:', changes.find(c => c.name === 'bodyStyle'));
    onBatchChange(changes);
  }, [onBatchChange, onChange]);

  // Handle dropdown changes
  const handleDropdownChange = useCallback((field: string) => (value: string) => {
    const syntheticEvent = {
      target: { name: field, value: value }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  }, [onChange]);

  // Cache specs by trim to prevent duplicate API calls
  const [specsCache, setSpecsCache] = useState<Record<string, { engine: string; transmission: string; drivetrain: string; bodyStyle?: string }>>({});
  const [loadingSpecs, setLoadingSpecs] = useState(false);

  // Handle trim change with auto-population and fallback priority
  const handleTrimChange = useCallback(async (value: string) => {
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

    // ✅ FIX: PRIORITY 1: Use specs from trim object if engine exists (transmission can be extracted from description)
    // Don't require both engine AND transmission - if engine exists, use trim specs and extract missing fields
    if (selectedTrim.specs?.engine) {
      console.log('✅ Using specs from trim object:', selectedTrim.specs);
      
      // Use engine from trim specs
      onSelectChange(selectedTrim.specs.engine, 'engineCylinders');
      
      // Use transmission from trim specs, or extract from description if missing
      if (selectedTrim.specs.transmission) {
        onSelectChange(selectedTrim.specs.transmission, 'transmission');
      } else if (selectedTrim.description) {
        // ✅ FIX: Extract transmission from description if not in specs
        const extractedTransmission = vinService.extractTransmissionFromDescription(selectedTrim.description);
        if (extractedTransmission) {
          console.log('✅ Extracted transmission from description:', extractedTransmission);
          onSelectChange(extractedTransmission, 'transmission');
        }
      }
      
      // Use drivetrain from trim specs (only if not already set)
      if (selectedTrim.specs.drivetrain && !formData.drivetrain) {
        onSelectChange(selectedTrim.specs.drivetrain, 'drivetrain');
      } else if (!formData.drivetrain && selectedTrim.description) {
        // ✅ FIX: Extract drivetrain from description if not in specs
        const extractedDrivetrain = vinService.extractDrivetrainFromDescription(selectedTrim.description);
        if (extractedDrivetrain) {
          console.log('✅ Extracted drivetrain from description:', extractedDrivetrain);
          onSelectChange(extractedDrivetrain, 'drivetrain');
        }
      }
      
      // Use bodyStyle from trim specs
      if (selectedTrim.specs.bodyStyle) {
        onSelectChange(selectedTrim.specs.bodyStyle, 'bodyStyle');
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
      if (cachedSpecs.bodyStyle) {
        onSelectChange(cachedSpecs.bodyStyle, 'bodyStyle');
      }
      return; // Exit early - specs from cache
    }

    // ✅ FIX: PRIORITY 3: Fetch specs via API ONLY if engine is truly missing from trim object
    // Don't fetch if we already have engine from trim specs (even if transmission is missing - we extract it above)
    if (!selectedTrim.specs?.engine) {
      setLoadingSpecs(true);
      try {
        console.log('⚠️ Engine missing from trim specs, fetching from API for trim:', selectedTrim.name);
        const specs = await vinService.fetchSpecsByYearMakeModelTrim(
          formData.year, formData.make, formData.model, selectedTrim.name
        );
        
        if (specs && specs.engine) {
          // Cache the specs
          setSpecsCache(prev => ({ ...prev, [cacheKey]: specs }));
          
          // Update formData with fetched specs
          if (specs.engine) {
            onSelectChange(specs.engine, 'engineCylinders');
          }
          if (specs.transmission) {
            onSelectChange(specs.transmission, 'transmission');
          } else if (selectedTrim.description) {
            // ✅ FIX: Extract transmission from description if API didn't return it
            const extractedTransmission = vinService.extractTransmissionFromDescription(selectedTrim.description);
            if (extractedTransmission) {
              console.log('✅ Extracted transmission from description (after API fetch):', extractedTransmission);
              onSelectChange(extractedTransmission, 'transmission');
            }
          }
          if (specs.drivetrain && !formData.drivetrain) {
            onSelectChange(specs.drivetrain, 'drivetrain');
          } else if (!formData.drivetrain && selectedTrim.description) {
            // ✅ FIX: Extract drivetrain from description if API didn't return it
            const extractedDrivetrain = vinService.extractDrivetrainFromDescription(selectedTrim.description);
            if (extractedDrivetrain) {
              console.log('✅ Extracted drivetrain from description (after API fetch):', extractedDrivetrain);
              onSelectChange(extractedDrivetrain, 'drivetrain');
            }
          }
          if (specs.bodyStyle) {
            onSelectChange(specs.bodyStyle, 'bodyStyle');
          }
        } else {
          // PRIORITY 4: Try extracting from description as last resort
          console.warn('⚠️ Specs not available from API for trim:', selectedTrim.name);
          if (selectedTrim.description) {
            console.log('⚠️ Attempting to extract specs from description as fallback');
            const extractedEngine = vinService.extractEngineFromDescription(selectedTrim.description);
            const extractedTransmission = vinService.extractTransmissionFromDescription(selectedTrim.description);
            const extractedDrivetrain = vinService.extractDrivetrainFromDescription(selectedTrim.description);
            
            if (extractedEngine) {
              onSelectChange(extractedEngine, 'engineCylinders');
            } else {
              onSelectChange('Not Available', 'engineCylinders');
            }
            
            if (extractedTransmission) {
              onSelectChange(extractedTransmission, 'transmission');
            } else {
              onSelectChange('Not Available', 'transmission');
            }
            
            if (extractedDrivetrain && !formData.drivetrain) {
              onSelectChange(extractedDrivetrain, 'drivetrain');
            } else if (!formData.drivetrain) {
              onSelectChange('Not Available', 'drivetrain');
            }
          } else {
            // No description available - show "Not Available"
            onSelectChange('Not Available', 'engineCylinders');
            onSelectChange('Not Available', 'transmission');
            if (!formData.drivetrain) {
              onSelectChange('Not Available', 'drivetrain');
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching specs:', error);
        // ✅ FIX: Try extracting from description on error instead of just showing "Not Available"
        if (selectedTrim.description) {
          console.log('⚠️ API failed, attempting to extract specs from description');
          const extractedEngine = vinService.extractEngineFromDescription(selectedTrim.description);
          const extractedTransmission = vinService.extractTransmissionFromDescription(selectedTrim.description);
          const extractedDrivetrain = vinService.extractDrivetrainFromDescription(selectedTrim.description);
          
          if (extractedEngine) {
            onSelectChange(extractedEngine, 'engineCylinders');
          } else {
            onSelectChange('Not Available', 'engineCylinders');
          }
          
          if (extractedTransmission) {
            onSelectChange(extractedTransmission, 'transmission');
          } else {
            onSelectChange('Not Available', 'transmission');
          }
          
          if (extractedDrivetrain && !formData.drivetrain) {
            onSelectChange(extractedDrivetrain, 'drivetrain');
          } else if (!formData.drivetrain) {
            onSelectChange('Not Available', 'drivetrain');
          }
        } else {
          // No description - show "Not Available"
          onSelectChange('Not Available', 'engineCylinders');
          onSelectChange('Not Available', 'transmission');
          if (!formData.drivetrain) {
            onSelectChange('Not Available', 'drivetrain');
          }
        }
      } finally {
        setLoadingSpecs(false);
      }
    }
  }, [formData.year, formData.make, formData.model, formData.availableTrims, formData.displayTrim, formData.drivetrain, onSelectChange, specsCache]);

  // Handle trims update from manual selection
  const handleTrimsUpdate = useCallback((trims: TrimOption[]) => {
    if (onBatchChange) {
      onBatchChange([{ name: 'availableTrims', value: trims }]);
    }
  }, [onBatchChange]);

  const handleReset = useCallback(() => {
    if (!onBatchChange) return;

    const resetChanges = [
      { name: 'year', value: '' },
      { name: 'make', value: '' },
      { name: 'model', value: '' },
      { name: 'trim', value: '' },
      { name: 'displayTrim', value: '' },
      { name: 'vin', value: '' },
      { name: 'mileage', value: '' },
      { name: 'engineCylinders', value: '' },
      { name: 'transmission', value: '' },
      { name: 'drivetrain', value: '' },
      { name: 'bodyStyle', value: '' },
      { name: 'availableTrims', value: [] }
    ];

    console.log('Resetting all vehicle data');
    onBatchChange(resetChanges);
  }, [onBatchChange]);

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
      
      {/* Show summary view when fully decoded and trim selected - BELOW VinSection */}
      {isFullyDecoded && (
        <>
          {console.log('🔍 VehicleSummaryDisplay Props:', {
            year: formData.year,
            make: formData.make,
            model: formData.model,
            trim: formData.displayTrim,
            engine: formData.engineCylinders,
            transmission: formData.transmission,
            drivetrain: formData.drivetrain,
            vin: formData.vin,
            mileage: formData.mileage,
            vinType: typeof formData.vin,
            mileageType: typeof formData.mileage,
            vinLength: formData.vin?.length,
            mileageLength: formData.mileage?.length,
            fullFormData: formData
          })}
          <VehicleSummaryDisplay 
            year={formData.year}
            make={formData.make}
            model={formData.model}
            trim={formData.displayTrim}
            engine={formData.engineCylinders}
            transmission={formData.transmission}
            drivetrain={formData.drivetrain}
            vin={formData.vin}
            mileage={formData.mileage}
            bodyStyle={formData.bodyStyle}
            onEdit={handleReset}
          />
        </>
      )}
    </div>
  );
};

export default BasicVehicleInfo;