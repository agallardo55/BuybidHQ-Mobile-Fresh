import { useState } from "react";
import FormField from "./FormField";
import DropdownField from "./DropdownField";
import VinSection from "../VinSection";
import { TrimOption } from "../types";
import TrimDropdown from "./TrimDropdown";
import { vinService } from "@/services/vinService";
import { toast } from 'sonner';

interface VehicleIdentificationProps {
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
  onVehicleDataFetched: (data: {
    year: string;
    make: string;
    model: string;
    trim: string;
    displayTrim: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
    availableTrims: TrimOption[];
  }) => void;
  onSelectChange: (value: string, name: string) => void;
  showValidation?: boolean;
}

const VehicleIdentification = ({
  formData,
  errors,
  onChange,
  onVehicleDataFetched,
  onSelectChange,
  showValidation
}: VehicleIdentificationProps) => {
  // Use derived state: VIN decode succeeded if we have vehicle data
  const vinDecodedSuccessfully = !!(formData.year && formData.make && formData.model && formData.availableTrims?.length > 0);

  // Add debug logging for the callback
  const handleVehicleDataFetched = (data: any) => {
    console.log('📦 VehicleIdentification handleVehicleDataFetched called with:', data);
    console.log('📦 Current formData before update:', formData);
    onVehicleDataFetched(data);
  };

  // Add comprehensive debug logging
  console.log('🔍 VIN Decode Debug:', {
    vinDecodedSuccessfully,
    formData: {
      year: formData.year,
      make: formData.make,
      model: formData.model,
      availableTrims: formData.availableTrims?.length,
    },
    vin: formData.vin,
  });

  console.log('🔍 Derived State Check:', {
    hasYear: !!formData.year,
    hasMake: !!formData.make,
    hasModel: !!formData.model,
    hasTrims: !!formData.availableTrims?.length,
    trimsLength: formData.availableTrims?.length,
    result: vinDecodedSuccessfully,
    rawFormData: formData,
  });

  // Generate dropdown options from available trims (Manheim style)
  // For model dropdown, we want to show the model with engine type, not trim values
  const modelOptions = formData.availableTrims?.length > 0 ? 
    [{ value: formData.model, label: formData.model }] : 
    [];

  // Generate year options (current year + 1 to 1990 - newest to oldest)
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1; // Include 1 future model year
  const minYear = 1990; // Start from 1990
  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
    const year = maxYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  // Common make options (expandable)
  const makeOptions = [
    { value: "LAND ROVER", label: "LAND ROVER" },
    { value: "PORSCHE", label: "PORSCHE" },
    { value: "MCLAREN", label: "MCLAREN" },
    { value: "ROLLS-ROYCE", label: "ROLLS-ROYCE" },
    { value: "BMW", label: "BMW" },
    { value: "MERCEDES-BENZ", label: "MERCEDES-BENZ" },
    { value: "AUDI", label: "AUDI" },
    { value: "LEXUS", label: "LEXUS" },
    { value: "TOYOTA", label: "TOYOTA" },
    { value: "HONDA", label: "HONDA" },
    { value: "FORD", label: "FORD" },
    { value: "CHEVROLET", label: "CHEVROLET" },
    { value: "NISSAN", label: "NISSAN" },
    { value: "HYUNDAI", label: "HYUNDAI" },
    { value: "KIA", label: "KIA" },
    { value: "MAZDA", label: "MAZDA" },
    { value: "SUBARU", label: "SUBARU" },
    { value: "VOLKSWAGEN", label: "VOLKSWAGEN" },
    { value: "VOLVO", label: "VOLVO" },
    { value: "JAGUAR", label: "JAGUAR" },
    { value: "INFINITI", label: "INFINITI" },
    { value: "ACURA", label: "ACURA" },
    { value: "GENESIS", label: "GENESIS" },
    { value: "LINCOLN", label: "LINCOLN" },
    { value: "CADILLAC", label: "CADILLAC" },
    { value: "BUICK", label: "BUICK" },
    { value: "CHRYSLER", label: "CHRYSLER" },
    { value: "DODGE", label: "DODGE" },
    { value: "JEEP", label: "JEEP" },
    { value: "RAM", label: "RAM" },
    { value: "GMC", label: "GMC" },
    { value: "ALFA ROMEO", label: "ALFA ROMEO" },
    { value: "MASERATI", label: "MASERATI" },
    { value: "BENTLEY", label: "BENTLEY" },
    { value: "ASTON MARTIN", label: "ASTON MARTIN" },
    { value: "FERRARI", label: "FERRARI" },
    { value: "LAMBORGHINI", label: "LAMBORGHINI" },
    { value: "BUGATTI", label: "BUGATTI" },
    { value: "KOENIGSEGG", label: "KOENIGSEGG" },
    { value: "PAGANI", label: "PAGANI" }
  ];

  const handleDropdownChange = (field: string) => (value: string) => {
    const syntheticEvent = {
      target: { name: field, value: value }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // Cache specs by trim to prevent duplicate API calls
  const [specsCache, setSpecsCache] = useState<Record<string, { engine: string; transmission: string; drivetrain: string }>>({});
  const [loadingSpecs, setLoadingSpecs] = useState(false);

  const handleTrimChange = async (value: string) => {
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

  const handleEditManually = () => {
    // Clear VIN to force manual entry
    onChange({
      target: { name: 'vin', value: '' }
    } as React.ChangeEvent<HTMLInputElement>);
    
    // Clear vehicle data to reset derived state
    onVehicleDataFetched({
      year: '',
      make: '',
      model: '',
      trim: '',
      displayTrim: '',
      engineCylinders: '',
      transmission: '',
      drivetrain: '',
      availableTrims: []
    });
    
    // Show toast message
    toast.info('Switched to manual entry. Correct any incorrect information.');
  };

  return (
    <div className="space-y-4">
      <VinSection 
        vin={formData.vin}
        onChange={onChange}
        error={errors.vin}
        onVehicleDataFetched={handleVehicleDataFetched}
        showValidation={showValidation}
        onEditManually={handleEditManually}
      />
      
      {/* Only show manual dropdowns if VIN decode hasn't succeeded */}
      {(() => {
        console.log('🎯 Conditional Rendering Check:', {
          vinDecodedSuccessfully,
          willShowDropdowns: !vinDecodedSuccessfully,
          formDataYear: formData.year,
          formDataMake: formData.make,
          formDataModel: formData.model,
          formDataTrimsLength: formData.availableTrims?.length
        });
        return !vinDecodedSuccessfully;
      })() && (
        <>
          {/* Year Dropdown */}
          <DropdownField
            id="year"
            label="Year"
            value={formData.year}
            options={yearOptions}
            onChange={handleDropdownChange('year')}
            error={errors.year}
            showValidation={showValidation}
          />

          {/* Make Dropdown */}
          <DropdownField
            id="make"
            label="Make"
            value={formData.make}
            options={makeOptions}
            onChange={handleDropdownChange('make')}
            error={errors.make}
            showValidation={showValidation}
          />

          {/* Model Dropdown (Manheim Style - includes engine type) */}
          <DropdownField
            id="model"
            label="Model"
            value={formData.model}
            options={modelOptions}
            onChange={handleDropdownChange('model')}
            error={errors.model}
            showValidation={showValidation}
          />

          {/* Trim Dropdown (Body Style + Trim Level) */}
          <TrimDropdown
            trims={formData.availableTrims}
            selectedTrim={formData.displayTrim || ''}
            onTrimChange={handleTrimChange}
            error={errors.trim}
            showValidation={showValidation}
          />
        </>
      )}
    </div>
  );
};

export default VehicleIdentification;
