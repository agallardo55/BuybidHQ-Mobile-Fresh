
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BuyerFormData } from "@/types/buyers";

interface AddressSectionProps {
  formData: Pick<BuyerFormData, 'dealershipAddress' | 'city' | 'state' | 'zipCode'>;
  onFormDataChange: (data: Partial<BuyerFormData>) => void;
}

const AddressSection = ({ formData, onFormDataChange }: AddressSectionProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFormDataChange({
      [name]: value,
    });
  };

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  return (
    <>
      <div>
        <label htmlFor="dealershipAddress" className="block text-sm font-medium text-gray-700">
          Dealership Address
        </label>
        <Input
          id="dealershipAddress"
          name="dealershipAddress"
          type="text"
          required
          value={formData.dealershipAddress}
          onChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <Input
            id="city"
            name="city"
            type="text"
            required
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <Select onValueChange={(value) => onFormDataChange({ state: value })} value={formData.state}>
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
              required
              value={formData.zipCode}
              onChange={handleChange}
              pattern="[0-9]{5}"
              maxLength={5}
              placeholder="12345"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressSection;
