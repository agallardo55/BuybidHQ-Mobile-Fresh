
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface VinInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFetchDetails: () => void;
  isLoading: boolean;
}

const VinInput = ({ value, onChange, onFetchDetails, isLoading }: VinInputProps) => {
  return (
    <div>
      <Label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
        VIN <span className="text-red-500">*</span>
      </Label>
      <div className="flex gap-2">
        <Input
          id="vin"
          name="vin"
          value={value}
          onChange={onChange}
          placeholder="Enter VIN"
          maxLength={17}
        />
        <Button 
          type="button" 
          className="bg-custom-blue hover:bg-custom-blue/90 px-6"
          onClick={onFetchDetails}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Go"}
        </Button>
      </div>
    </div>
  );
};

export default VinInput;
