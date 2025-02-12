
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VehicleConditionProps {
  formData: {
    windshield: string;
    engineLights: string;
    brakes: string;
    tire: string;
    maintenance: string;
    reconEstimate: string;
    reconDetails: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (value: string, name: string) => void;
}

const VehicleCondition = ({ formData, onChange, onSelectChange }: VehicleConditionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="windshield" className="block text-sm font-medium text-gray-700 mb-1">
          Windshield
        </label>
        <Select name="windshield" onValueChange={(value) => onSelectChange(value, "windshield")}>
          <SelectTrigger>
            <SelectValue placeholder="Choose One" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">Clear</SelectItem>
            <SelectItem value="chips">Chips</SelectItem>
            <SelectItem value="smallCracks">Small cracks</SelectItem>
            <SelectItem value="largeCracks">Large cracks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="engineLights" className="block text-sm font-medium text-gray-700 mb-1">
          Engine Lights
        </label>
        <Select name="engineLights" onValueChange={(value) => onSelectChange(value, "engineLights")}>
          <SelectTrigger>
            <SelectValue placeholder="Choose One" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="engine">Engine Light</SelectItem>
            <SelectItem value="maintenance">Maintenance Required</SelectItem>
            <SelectItem value="mobile">Mobile Device</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="brakes" className="block text-sm font-medium text-gray-700 mb-1">
          Brakes
        </label>
        <Select name="brakes" onValueChange={(value) => onSelectChange(value, "brakes")}>
          <SelectTrigger>
            <SelectValue placeholder="Choose One" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="excellent">Excellent</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="poor">Poor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="tire" className="block text-sm font-medium text-gray-700 mb-1">
          Tire
        </label>
        <Select name="tire" onValueChange={(value) => onSelectChange(value, "tire")}>
          <SelectTrigger>
            <SelectValue placeholder="Choose One" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="poor">Poor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="maintenance" className="block text-sm font-medium text-gray-700 mb-1">
          Maintenance
        </label>
        <Select name="maintenance" onValueChange={(value) => onSelectChange(value, "maintenance")}>
          <SelectTrigger>
            <SelectValue placeholder="Choose One" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upToDate">Up to Date</SelectItem>
            <SelectItem value="needsService">Needs Service</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="reconEstimate" className="block text-sm font-medium text-gray-700 mb-1">
          Recon Estimate ($)
        </label>
        <Input
          id="reconEstimate"
          name="reconEstimate"
          type="number"
          value={formData.reconEstimate}
          onChange={onChange}
          placeholder="0"
        />
      </div>

      <div>
        <label htmlFor="reconDetails" className="block text-sm font-medium text-gray-700 mb-1">
          Recon Details
        </label>
        <Textarea
          id="reconDetails"
          name="reconDetails"
          value={formData.reconDetails}
          onChange={onChange}
          placeholder="Enter reconditioning details..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default VehicleCondition;
