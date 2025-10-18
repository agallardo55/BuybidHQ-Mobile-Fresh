
import FormField from "./FormField";
import DropdownField from "./DropdownField";
import VinSection from "../VinSection";
import { TrimOption } from "../types";
import TrimDropdown from "./TrimDropdown";
import { vinService } from "@/services/vinService";

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
  console.log('VehicleIdentification rendered with formData:', formData);
  console.log('VehicleIdentification - availableTrims:', formData.availableTrims);
  console.log('VehicleIdentification - model:', formData.model);
  console.log('VehicleIdentification - displayTrim:', formData.displayTrim);

  // Generate dropdown options from available trims (Manheim style)
  // For model dropdown, we want to show the model with engine type, not trim values
  const modelOptions = formData.availableTrims?.length > 0 ? 
    [{ value: formData.model, label: formData.model }] : 
    [];

  // Generate year options (current year ± 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 21 }, (_, i) => {
    const year = currentYear - 10 + i;
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

  return (
    <div className="space-y-4">
      <VinSection 
        vin={formData.vin}
        onChange={onChange}
        error={errors.vin}
        onVehicleDataFetched={onVehicleDataFetched}
        showValidation={showValidation}
      />
      
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
    </div>
  );
};

export default VehicleIdentification;
