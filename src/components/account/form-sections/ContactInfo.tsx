
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CarrierType } from "@/types/users";
import { usePhoneFormat } from "@/hooks/signup/usePhoneFormat";

const CARRIER_OPTIONS: CarrierType[] = [
  'Verizon Wireless',
  'AT&T',
  'T-Mobile',
  'Sprint',
  'US Cellular',
  'Metro PCS',
  'Boost Mobile',
  'Cricket',
  'Virgin Mobile'
];

interface ContactInfoProps {
  formData: {
    fullName: string;
    email: string;
    mobileNumber: string;
    phoneCarrier?: CarrierType;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => void;
}

export const ContactInfo = ({ formData, handleChange }: ContactInfoProps) => {
  const { formatPhoneNumber } = usePhoneFormat();

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    handleChange({ target: { name: 'mobileNumber', value: formatted } });
  };

  return (
    <>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          required
          value={formData.fullName}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address <span className="text-red-500">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <Input
          id="mobileNumber"
          name="mobileNumber"
          type="tel"
          required
          value={formData.mobileNumber}
          onChange={handleMobileNumberChange}
          placeholder="(123) 456-7890"
          maxLength={14}
        />
      </div>
      <div>
        <label htmlFor="phoneCarrier" className="block text-sm font-medium text-gray-700 mb-1">
          Mobile Carrier <span className="text-red-500">*</span>
        </label>
        <Select
          value={formData.phoneCarrier}
          onValueChange={(value) => handleChange({ target: { name: 'phoneCarrier', value } })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select carrier" />
          </SelectTrigger>
          <SelectContent>
            {CARRIER_OPTIONS.map(carrier => (
              <SelectItem key={carrier} value={carrier}>
                {carrier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
