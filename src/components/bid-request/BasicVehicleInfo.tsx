
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
    availableTrims: Array<{
      name: string;
      description: string;
      specs?: {
        engine?: string;
        transmission?: string;
        drivetrain?: string;
      }
    }>;
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
  const handleVehicleDataFetched = (data: {
    year: string;
    make: string;
    model: string;
    trim: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
    availableTrims: Array<{
      name: string;
      description: string;
      specs?: {
        engine?: string;
        transmission?: string;
        drivetrain?: string;
      }
    }>;
  }) => {
    console.log('Vehicle data received in BasicVehicleInfo:', data);
    
    // Always use batch changes to properly handle complex data
    const changes = Object.entries(data).map(([name, value]) => ({
      name,
      value
    }));
    
    console.log('Sending batch changes:', changes);
    
    if (onBatchChange) {
      onBatchChange(changes);
    } else {
      // Fallback for simple string values if batch change isn't available
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          const syntheticEvent = {
            target: {
              name: key,
              value: value
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
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
