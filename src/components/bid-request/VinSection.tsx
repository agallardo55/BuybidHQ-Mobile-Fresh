
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            id="vin"
            name="vin"
            type="text"
            value={vin}
            onChange={onChange}
            required
            placeholder="1HGCM82633A123456"
            className={`${error ? "border-red-500" : ""} rounded-r-none`}
            maxLength={17}
          />
        </div>
        <Button 
          type="button"
          className="bg-custom-blue hover:bg-custom-blue/90 rounded-l-none"
          onClick={() => {
            toast.info("VIN lookup functionality coming soon!");
          }}
        >
          Go
        </Button>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default VinSection;
