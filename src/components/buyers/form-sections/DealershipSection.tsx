
import { Input } from "@/components/ui/input";
import { BuyerFormData } from "@/types/buyers";

interface DealershipSectionProps {
  formData: Pick<BuyerFormData, 'dealershipName' | 'licenseNumber'>;
  onFormDataChange: (data: Partial<BuyerFormData>) => void;
}

const DealershipSection = ({ formData, onFormDataChange }: DealershipSectionProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFormDataChange({
      [name]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="dealershipName" className="block text-sm font-medium text-gray-700">
          Dealership Name
        </label>
        <Input
          id="dealershipName"
          name="dealershipName"
          type="text"
          required
          value={formData.dealershipName}
          onChange={handleChange}
          placeholder="Enter dealership name"
        />
      </div>
      <div>
        <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
          Dealer License ID
        </label>
        <Input
          id="licenseNumber"
          name="licenseNumber"
          type="text"
          value={formData.licenseNumber}
          onChange={handleChange}
          placeholder="Enter dealer license ID"
          className="font-mono"
        />
        {formData.licenseNumber && (
          <p className="text-xs text-gray-500 mt-1">
            This ID will be used to identify the dealership in the system
          </p>
        )}
      </div>
    </div>
  );
};

export default DealershipSection;
