
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
  const formatDollarAmount = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(numericValue));
    
    return formattedValue;
  };

  const handleReconEstimateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: numericValue
      }
    };
    onChange(syntheticEvent);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="windshield" className="block text-sm font-medium text-gray-700 mb-1">
          Windshield
        </label>
        <Select name="windshield" onValueChange={(value) => onSelectChange(value, "windshield")} value={formData.windshield || "clear"}>
          <SelectTrigger>
            <SelectValue placeholder="Clear" />
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
        <Select name="engineLights" onValueChange={(value) => onSelectChange(value, "engineLights")} value={formData.engineLights || "none"}>
          <SelectTrigger>
            <SelectValue placeholder="None" />
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
        <Select name="brakes" onValueChange={(value) => onSelectChange(value, "brakes")} value={formData.brakes || "acceptable"}>
          <SelectTrigger>
            <SelectValue placeholder="Acceptable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="acceptable">Acceptable</SelectItem>
            <SelectItem value="replaceFront">Replace front</SelectItem>
            <SelectItem value="replaceRear">Replace rear</SelectItem>
            <SelectItem value="replaceAll">Replace all</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="tire" className="block text-sm font-medium text-gray-700 mb-1">
          Tire
        </label>
        <Select name="tire" onValueChange={(value) => onSelectChange(value, "tire")} value={formData.tire || "acceptable"}>
          <SelectTrigger>
            <SelectValue placeholder="Acceptable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="acceptable">Acceptable</SelectItem>
            <SelectItem value="replaceFront">Replace front</SelectItem>
            <SelectItem value="replaceRear">Replace rear</SelectItem>
            <SelectItem value="replaceAll">Replace all</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="maintenance" className="block text-sm font-medium text-gray-700 mb-1">
          Maintenance
        </label>
        <Select name="maintenance" onValueChange={(value) => onSelectChange(value, "maintenance")} value={formData.maintenance || "upToDate"}>
          <SelectTrigger>
            <SelectValue placeholder="Up to date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upToDate">Up to date</SelectItem>
            <SelectItem value="basicService">Basic service needed</SelectItem>
            <SelectItem value="minorService">Minor service needed</SelectItem>
            <SelectItem value="majorService">Major service needed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="reconEstimate" className="block text-sm font-medium text-gray-700 mb-1">
          Recon Estimate
        </label>
        <Input
          id="reconEstimate"
          name="reconEstimate"
          type="text"
          value={formData.reconEstimate ? formatDollarAmount(formData.reconEstimate) : ''}
          onChange={handleReconEstimateChange}
          placeholder="$0"
          className="font-mono focus:ring-1 focus:ring-offset-0"
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
          className="min-h-[100px] focus-visible:ring-custom-blue"
        />
      </div>
    </div>
  );
};

export default VehicleCondition;
