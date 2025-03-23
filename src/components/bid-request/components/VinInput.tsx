
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
    <div className="w-full">
      <Label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
        VIN <span className="text-red-500">*</span>
      </Label>
      <div className="flex w-full">
        <Input
          id="vin"
          name="vin"
          value={value}
          onChange={onChange}
          placeholder="Enter VIN"
          maxLength={17}
          className="rounded-r-none h-9 flex-1"
        />
        <Button 
          type="button" 
          className="bg-custom-blue hover:bg-custom-blue/90 rounded-l-none border-l-0 h-9"
          onClick={onFetchDetails}
          disabled={isLoading}
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader className="h-3 w-3 animate-spin mr-1" />
              <span className="hidden sm:inline text-xs">Loading</span>
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
