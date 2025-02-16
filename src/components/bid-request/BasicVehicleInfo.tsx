
import VehicleIdentification from "./components/VehicleIdentification";
import VehicleSpecifications from "./components/VehicleSpecifications";

interface BasicVehicleInfoProps {
  formData: {
    year: string;
    make: string;
    model: string;
    trim: string;
    mileage: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
    vin: string;
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
  onBatchChange?: (changes: Array<{ name: string; value: string }>) => void;
}

const BasicVehicleInfo = ({ formData, errors, onChange, onBatchChange }: BasicVehicleInfoProps) => {
  const handleVehicleDataFetched = (data: {
    year: string;
    make: string;
    model: string;
    trim: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
  }) => {
    if (onBatchChange) {
      const changes = Object.entries(data).map(([name, value]) => ({
        name,
        value: value || "",
      }));
      onBatchChange(changes);
    } else {
      Object.entries(data).forEach(([key, value]) => {
        const syntheticEvent = {
          target: {
            name: key,
            value: value || ""
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VehicleIdentification
          formData={formData}
          errors={errors}
          onChange={onChange}
          onVehicleDataFetched={handleVehicleDataFetched}
        />
        <VehicleSpecifications
          formData={formData}
          errors={errors}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default BasicVehicleInfo;
