
import { Input } from "@/components/ui/input";

interface AddressInfoProps {
  formData: {
    dealershipAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AddressInfo = ({ formData, handleChange }: AddressInfoProps) => {
  return (
    <>
      <div>
        <label htmlFor="dealershipAddress" className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <Input
          id="dealershipAddress"
          name="dealershipAddress"
          type="text"
          value={formData.dealershipAddress}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
          City
        </label>
        <Input
          id="city"
          name="city"
          type="text"
          value={formData.city}
          onChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <Input
            id="state"
            name="state"
            type="text"
            value={formData.state}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code
          </label>
          <Input
            id="zipCode"
            name="zipCode"
            type="text"
            value={formData.zipCode}
            onChange={handleChange}
            maxLength={5}
          />
        </div>
      </div>
    </>
  );
};
