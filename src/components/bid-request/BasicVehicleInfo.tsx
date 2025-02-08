
import { Input } from "@/components/ui/input";

interface BasicVehicleInfoProps {
  formData: {
    year: string;
    make: string;
    model: string;
    trim: string;
    mileage: string;
  };
  errors: {
    year?: string;
    make?: string;
    model?: string;
    mileage?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicVehicleInfo = ({ formData, errors, onChange }: BasicVehicleInfoProps) => {
  return (
    <div className="space-y-4">
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
          className={errors.year ? "border-red-500" : ""}
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
          className={errors.make ? "border-red-500" : ""}
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
          className={errors.model ? "border-red-500" : ""}
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
        />
      </div>
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
          className={errors.mileage ? "border-red-500" : ""}
        />
        {errors.mileage && (
          <p className="text-red-500 text-sm mt-1">{errors.mileage}</p>
        )}
      </div>
    </div>
  );
};

export default BasicVehicleInfo;
