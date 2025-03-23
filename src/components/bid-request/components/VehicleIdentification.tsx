import FormField from "./FormField";
import VinSection from "../VinSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrimOption } from "../types";
import TrimSelector from "./TrimSelector";

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

  // Deduplicate trims before rendering
  const uniqueTrims = formData.availableTrims.reduce((acc: TrimOption[], current) => {
    const isDuplicate = acc.some(item => {
      // Consider a trim duplicate if:
      // - Names match exactly OR
      // - Both are "GT3 RS" related
      return item.name === current.name || 
             (item.name === 'GT3 RS' && current.name === 'GT3 RS');
    });
    
    if (!isDuplicate) {
      acc.push(current);
    }
    return acc;
  }, []);

  const cleanTrimDescription = (description: string): string => {
    if (!description) return '';

    // First remove the engine specs within parentheses
    let cleaned = description.replace(/\s*\([^)]*\)/g, '');

    // If the description starts with the trim name, keep it
    // Otherwise use the entire cleaned description
    const parts = cleaned.split(' ');
    if (parts.length > 1) {
      // Keep everything except engine displacement at the end
      cleaned = parts
        .filter(part => !part.match(/^\d+\.?\d*L$/)) // Remove engine displacement
        .join(' ')
        .trim();
    }

    console.log(`Cleaned trim description: "${description}" -> "${cleaned}"`);
    return cleaned;
  };

  const getDisplayValue = (trim: TrimOption): string => {
    // If we have both name and description, combine them appropriately
    if (trim.name && trim.description) {
      // If the description already starts with the name, just clean the description
      if (trim.description.startsWith(trim.name)) {
        return cleanTrimDescription(trim.description);
      }
      // Otherwise, combine name with cleaned description
      const cleanedDesc = cleanTrimDescription(trim.description);
      // Avoid duplication if the name is already part of the cleaned description
      if (!cleanedDesc.includes(trim.name)) {
        return `${trim.name} ${cleanedDesc}`;
      }
      return cleanedDesc;
    }
    // Fallback to whatever we have
    return cleanTrimDescription(trim.name || trim.description || '');
  };

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
      <div>
        <label htmlFor="trim" className="block text-sm font-medium text-gray-700 mb-1">
          Trim <span className="text-red-500">*</span>
        </label>
        <Select
          value={formData.displayTrim || ''} 
          onValueChange={handleTrimChange}
        >
          <SelectTrigger 
            id="trim"
            className={`w-full bg-white hover:bg-gray-50 transition-colors [&>span]:!line-clamp-none ${errors.trim && showValidation ? "border-red-500" : ""}`}
          >
            <SelectValue placeholder="Select trim level" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {uniqueTrims && uniqueTrims.length > 0 ? (
              uniqueTrims.map((trim, index) => {
                const displayValue = getDisplayValue(trim);
                return (
                  <SelectItem 
                    key={`${displayValue}-${index}`} 
                    value={displayValue}
                    className="hover:bg-blue-50 focus:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <div className="w-full whitespace-normal break-words">
                      <div className="font-medium text-gray-900">
                        {displayValue}
                      </div>
                    </div>
                  </SelectItem>
                );
              })
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
