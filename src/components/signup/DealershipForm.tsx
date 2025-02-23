
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DealershipFormProps {
  formData: {
    dealershipName: string;
    licenseNumber: string;
    businessNumber: string;
    dealershipAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  onBack: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStateChange: (value: string) => void;
  isSubmitting: boolean;
  states: string[];
}

const DealershipForm = ({ 
  formData, 
  onBack, 
  onChange, 
  onStateChange, 
  isSubmitting,
  states 
}: DealershipFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="dealershipName" className="block text-sm font-medium text-gray-700">
            Dealership Name
          </label>
          <Input
            id="dealershipName"
            name="dealershipName"
            type="text"
            value={formData.dealershipName}
            onChange={onChange}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
            Dealer ID
          </label>
          <Input
            id="licenseNumber"
            name="licenseNumber"
            type="text"
            value={formData.licenseNumber}
            onChange={onChange}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700">
            Business Number
          </label>
          <Input
            id="businessNumber"
            name="businessNumber"
            type="tel"
            value={formData.businessNumber}
            onChange={onChange}
            placeholder="(123) 456-7890"
            maxLength={14}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="dealershipAddress" className="block text-sm font-medium text-gray-700">
            Dealership Address
          </label>
          <Input
            id="dealershipAddress"
            name="dealershipAddress"
            type="text"
            value={formData.dealershipAddress}
            onChange={onChange}
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <Input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={onChange}
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <Select onValueChange={onStateChange} value={formData.state}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
            ZIP Code
          </label>
          <Input
            id="zipCode"
            name="zipCode"
            type="text"
            value={formData.zipCode}
            onChange={onChange}
            pattern="[0-9]{5}"
            maxLength={5}
            placeholder="12345"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="button"
          onClick={onBack}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="w-full bg-custom-blue text-white hover:bg-custom-blue/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Sign up"}
        </Button>
      </div>
    </div>
  );
};

export default DealershipForm;
