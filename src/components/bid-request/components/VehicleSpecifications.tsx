
import FormField from "./FormField";

interface VehicleSpecificationsProps {
  formData: {
    mileage: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
  };
  errors: {
    mileage?: string;
    engineCylinders?: string;
    transmission?: string;
    drivetrain?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VehicleSpecifications = ({
  formData,
  errors,
  onChange
}: VehicleSpecificationsProps) => {
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
      />
      <FormField
        id="engineCylinders"
        label="Engine"
        value={formData.engineCylinders}
        onChange={onChange}
        error={errors.engineCylinders}
        placeholder="Example: 2.0L 4-Cylinder Turbo"
        required={false}
      />
      <FormField
        id="transmission"
        label="Transmission"
        value={formData.transmission}
        onChange={onChange}
        error={errors.transmission}
        placeholder="Example: 8-Speed Automatic"
        required={false}
      />
      <FormField
        id="drivetrain"
        label="Drivetrain"
        value={formData.drivetrain}
        onChange={onChange}
        error={errors.drivetrain}
        placeholder="Example: AWD, FWD, RWD"
        required={false}
      />
    </div>
  );
};

export default VehicleSpecifications;
