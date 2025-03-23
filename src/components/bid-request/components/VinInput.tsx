
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";

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
      <div className="flex relative">
        <Input
          id="vin"
          name="vin"
          value={value}
          onChange={onChange}
          placeholder="Enter VIN"
          maxLength={17}
          className="rounded-r-none pr-2"
        />
        <Button 
          type="button" 
          className="bg-custom-blue hover:bg-custom-blue/90 rounded-l-none border-l-0"
          onClick={onFetchDetails}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 animate-spin mr-1" />
              Loading
            </>
          ) : (
            "Go"
          )}
        </Button>
      </div>
    </div>
  );
};

export default VinInput;
