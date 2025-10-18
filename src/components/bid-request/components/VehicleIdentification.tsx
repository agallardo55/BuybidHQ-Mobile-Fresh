
import FormField from "./FormField";
import VinSection from "../VinSection";
import { TrimOption } from "../types";
import TrimDropdown from "./TrimDropdown";
import { getDisplayValue } from "../utils/trimUtils";

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

  const handleTrimChange = (value: string) => {
    console.log('Trim selected:', value);
    
    // Find the selected trim to auto-populate related fields
    const selectedTrim = formData.availableTrims.find(trim => 
      getDisplayValue(trim) === value
    );
    
    console.log('Selected trim details:', selectedTrim);

    if (selectedTrim) {
      // Store both display and database values
      const cleanedTrimValue = getDisplayValue(selectedTrim);
      onSelectChange(cleanedTrimValue, 'trim'); // For database
      onSelectChange(cleanedTrimValue, 'displayTrim'); // For dropdown display
      
      // Update engine and other specs if available
      if (selectedTrim.specs) {
        if (selectedTrim.specs.engine) {
          onSelectChange(selectedTrim.specs.engine, 'engineCylinders');
        }
        if (selectedTrim.specs.transmission) {
          onSelectChange(selectedTrim.specs.transmission, 'transmission');
        }
        if (selectedTrim.specs.drivetrain) {
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
      <FormField
        id="year"
        label="Year"
        type="number"
        value={formData.year}
        onChange={onChange}
        error={errors.year}
        placeholder="2024"
        showValidation={showValidation}
      />
      <FormField
        id="make"
        label="Make"
        value={formData.make}
        onChange={onChange}
        error={errors.make}
        placeholder="Toyota"
        showValidation={showValidation}
      />
      <FormField
        id="model"
        label="Model"
        value={formData.model}
        onChange={onChange}
        error={errors.model}
        placeholder="Camry"
        showValidation={showValidation}
      />
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
