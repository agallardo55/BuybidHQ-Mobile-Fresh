
import FormField from "./FormField";
import { vinService } from "@/services/vinService";

interface VehicleSpecificationsProps {
  formData: {
    mileage: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
    trim?: string;
    displayTrim?: string;
    make?: string;
    model?: string;
  };
  errors: {
    mileage?: string;
    engineCylinders?: string;
    transmission?: string;
    drivetrain?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showValidation?: boolean;
}

const VehicleSpecifications = ({
  formData,
  errors,
  onChange,
  showValidation
}: VehicleSpecificationsProps) => {
  // Determine if vehicle is electric and compute label/value
  const engine = formData.engineCylinders || '';
  const isElectric = engine?.toLowerCase().includes('electric');
  const engineLabel = isElectric ? 'Motor' : 'Engine';
  const engineValue = isElectric
    ? vinService.extractMotorConfig(
        formData.trim || formData.displayTrim || '', 
        engine,
        formData.drivetrain,
        formData.make,
        formData.model
      )
    : engine;

  return (
    <div className="space-y-4">
      <FormField
        id="mileage"
        label="Mileage"
        type="number"
        value={formData.mileage}
        onChange={onChange}
        error={errors.mileage}
        placeholder="35000"
        min="0"
        showValidation={showValidation}
      />
      <FormField
        id="engineCylinders"
        label={engineLabel}
        value={engineValue}
        onChange={onChange}
        error={errors.engineCylinders}
        placeholder={isElectric ? "Quad-Motor" : "2.0L 4-Cylinder Turbo"}
        required={false}
        showValidation={showValidation}
      />
      <FormField
        id="transmission"
        label="Transmission"
        value={formData.transmission}
        onChange={onChange}
        error={errors.transmission}
        placeholder="8-Speed Automatic"
        required={false}
        showValidation={showValidation}
      />
      <FormField
        id="drivetrain"
        label="Drivetrain"
        value={formData.drivetrain}
        onChange={onChange}
        error={errors.drivetrain}
        placeholder="AWD, FWD, RWD"
        required={false}
        showValidation={showValidation}
      />
    </div>
  );
};

export default VehicleSpecifications;
