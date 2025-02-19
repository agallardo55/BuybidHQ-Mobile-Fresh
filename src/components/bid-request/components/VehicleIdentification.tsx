
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
  console.log('Available trims in VehicleIdentification:', formData.availableTrims);

  const handleTrimChange = (value: string) => {
    console.log('Trim selected:', value);
    onSelectChange(value, 'trim');
    
    // Find the selected trim to auto-populate related fields
    const selectedTrim = formData.availableTrims.find(trim => trim.name === value);
    console.log('Selected trim details:', selectedTrim);
    
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
          value={formData.trim || ""}
          onValueChange={handleTrimChange}
        >
          <SelectTrigger 
            id="trim"
            className={`w-full bg-white hover:bg-gray-50 transition-colors ${errors.trim && showValidation ? "border-red-500" : ""}`}
          >
            <SelectValue placeholder="Select trim level" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {formData.availableTrims && formData.availableTrims.length > 0 ? (
              formData.availableTrims.map((trim, index) => (
                <SelectItem 
                  key={`${trim.name}-${index}`} 
                  value={trim.name}
                  className="hover:bg-blue-50 focus:bg-blue-50 transition-colors cursor-pointer"
                >
                  <div className="w-full">
                    <div className="font-medium text-gray-900">
                      {trim.name.replace(/\.{3,}|\.+$/g, '').trim()}
                    </div>
                    {trim.description && (
                      <div className="text-sm text-gray-500 mt-0.5">
                        {trim.description.replace(/\.{3,}|\.+$/g, '').trim()}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="default" disabled>No trim levels available</SelectItem>
            )}
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
