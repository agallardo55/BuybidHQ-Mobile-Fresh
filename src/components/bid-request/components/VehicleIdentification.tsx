
import FormField from "./FormField";
import VinSection from "../VinSection";

interface VehicleIdentificationProps {
  formData: {
    year: string;
    make: string;
    model: string;
    trim: string;
    vin: string;
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
  showValidation?: boolean;
}

const VehicleIdentification = ({
  formData,
  errors,
  onChange,
  onVehicleDataFetched,
  showValidation
}: VehicleIdentificationProps) => {
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
      <FormField
        id="trim"
        label="Trim"
        value={formData.trim}
        onChange={onChange}
        error={errors.trim}
        placeholder="SE"
        showValidation={showValidation}
      />
    </div>
  );
};

export default VehicleIdentification;
