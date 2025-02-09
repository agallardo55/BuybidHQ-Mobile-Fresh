
import { Input } from "@/components/ui/input";

interface VinSectionProps {
  vin: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const VinSection = ({ vin, onChange, error }: VinSectionProps) => {
  return (
    <div>
      <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
        VIN <span className="text-red-500">*</span>
      </label>
      <Input
        id="vin"
        name="vin"
        type="text"
        value={vin}
        onChange={onChange}
        required
        placeholder="1HGCM82633A123456"
        className={error ? "border-red-500" : ""}
        maxLength={17}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default VinSection;

