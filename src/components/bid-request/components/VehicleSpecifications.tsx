
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
        placeholder="2.5L 4-Cylinder"
      />
      <FormField
        id="transmission"
        label="Transmission"
        value={formData.transmission}
        onChange={onChange}
        error={errors.transmission}
        placeholder="8-Speed Automatic"
      />
      <FormField
        id="drivetrain"
        label="Drivetrain"
        value={formData.drivetrain}
        onChange={onChange}
        error={errors.drivetrain}
        placeholder="AWD"
      />
    </div>
  );
};

export default VehicleSpecifications;
