
import { Input } from "@/components/ui/input";
import VinSection from "./VinSection";

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
    mileage?: string;
    vin?: string;
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
      // Use batch update if available
      const changes = Object.entries(data).map(([name, value]) => ({
        name,
        value: value || "", // Ensure empty string for null/undefined values
      }));
      onBatchChange(changes);
    } else {
      // Fallback to individual updates
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
        {/* Left Column */}
        <div className="space-y-4">
          <VinSection 
            vin={formData.vin}
            onChange={onChange}
            error={errors.vin}
            onVehicleDataFetched={handleVehicleDataFetched}
          />
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <Input
              id="year"
              name="year"
              type="number"
              value={formData.year}
              onChange={onChange}
              required
              placeholder="2024"
              className={`${errors.year ? "border-red-500" : ""} focus:ring-1 focus:ring-offset-0`}
            />
            {errors.year && (
              <p className="text-red-500 text-sm mt-1">{errors.year}</p>
            )}
          </div>
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
              Make <span className="text-red-500">*</span>
            </label>
            <Input
              id="make"
              name="make"
              type="text"
              value={formData.make}
              onChange={onChange}
              required
              placeholder="Toyota"
              className={`${errors.make ? "border-red-500" : ""} focus:ring-1 focus:ring-offset-0`}
            />
            {errors.make && (
              <p className="text-red-500 text-sm mt-1">{errors.make}</p>
            )}
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Model <span className="text-red-500">*</span>
            </label>
            <Input
              id="model"
              name="model"
              type="text"
              value={formData.model}
              onChange={onChange}
              required
              placeholder="Camry"
              className={`${errors.model ? "border-red-500" : ""} focus:ring-1 focus:ring-offset-0`}
            />
            {errors.model && (
              <p className="text-red-500 text-sm mt-1">{errors.model}</p>
            )}
          </div>
          <div>
            <label htmlFor="trim" className="block text-sm font-medium text-gray-700 mb-1">
              Trim
            </label>
            <Input
              id="trim"
              name="trim"
              type="text"
              value={formData.trim}
              onChange={onChange}
              placeholder="SE"
              className="focus:ring-1 focus:ring-offset-0"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
              Mileage <span className="text-red-500">*</span>
            </label>
            <Input
              id="mileage"
              name="mileage"
              type="number"
              value={formData.mileage}
              onChange={onChange}
              required
              placeholder="35000"
              min="0"
              className={`${errors.mileage ? "border-red-500" : ""} focus:ring-1 focus:ring-offset-0`}
            />
            {errors.mileage && (
              <p className="text-red-500 text-sm mt-1">{errors.mileage}</p>
            )}
          </div>
          <div>
            <label htmlFor="engineCylinders" className="block text-sm font-medium text-gray-700 mb-1">
              Engine
            </label>
            <Input
              id="engineCylinders"
              name="engineCylinders"
              type="text"
              value={formData.engineCylinders}
              onChange={onChange}
              placeholder="V6"
              className="focus:ring-1 focus:ring-offset-0"
            />
          </div>
          <div>
            <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
              Transmission
            </label>
            <Input
              id="transmission"
              name="transmission"
              type="text"
              value={formData.transmission}
              onChange={onChange}
              placeholder="Automatic"
              className="focus:ring-1 focus:ring-offset-0"
            />
          </div>
          <div>
            <label htmlFor="drivetrain" className="block text-sm font-medium text-gray-700 mb-1">
              Drivetrain
            </label>
            <Input
              id="drivetrain"
              name="drivetrain"
              type="text"
              value={formData.drivetrain}
              onChange={onChange}
              placeholder="AWD"
              className="focus:ring-1 focus:ring-offset-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicVehicleInfo;
