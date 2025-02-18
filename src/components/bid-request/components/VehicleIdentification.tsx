
import FormField from "./FormField";
import VinSection from "../VinSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrimOption } from "../types";

interface VehicleIdentificationProps {
  formData: {
    year: string;
    make: string;
    model: string;
    trim: string;
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
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
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
  const handleTrimChange = (value: string) => {
    onSelectChange(value, 'trim');
    
    // Find the selected trim to auto-populate related fields
    const selectedTrim = formData.availableTrims.find(trim => trim.name === value);
    if (selectedTrim?.specs) {
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
      <div>
        <label htmlFor="trim" className="block text-sm font-medium text-gray-700 mb-1">
          Trim <span className="text-red-500">*</span>
        </label>
        <Select
          value={formData.trim}
          onValueChange={handleTrimChange}
        >
          <SelectTrigger 
            id="trim"
            className={`w-full ${errors.trim && showValidation ? "border-red-500" : ""}`}
          >
            <SelectValue placeholder="Select trim level" />
          </SelectTrigger>
          <SelectContent>
            {formData.availableTrims.map((trim) => (
              <SelectItem key={trim.name} value={trim.name}>
                <div>
                  <div className="font-medium">{trim.name}</div>
                  {trim.description && (
                    <div className="text-sm text-gray-500">{trim.description}</div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.trim && showValidation && (
          <p className="text-red-500 text-sm mt-1">{errors.trim}</p>
        )}
      </div>
    </div>
  );
};

export default VehicleIdentification;
