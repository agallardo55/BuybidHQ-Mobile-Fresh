
import VehicleIdentificationContainer from "./components/VehicleIdentificationContainer";
import VehicleSpecifications from "./components/VehicleSpecifications";
import { TrimOption } from "./types";

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
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VehicleIdentificationContainer
          formData={formData}
          errors={errors}
          onChange={onChange}
          onBatchChange={onBatchChange}
          onSelectChange={onSelectChange}
          showValidation={showValidation}
        />
        <VehicleSpecifications
          formData={formData}
          errors={errors}
          onChange={onChange}
          showValidation={showValidation}
        />
      </div>
    </div>
  );
};

export default BasicVehicleInfo;
