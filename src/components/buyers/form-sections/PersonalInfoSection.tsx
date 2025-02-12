
import { Input } from "@/components/ui/input";
import { BuyerFormData } from "@/types/buyers";

interface PersonalInfoSectionProps {
  formData: Pick<BuyerFormData, 'fullName' | 'email' | 'mobileNumber' | 'businessNumber'>;
  onFormDataChange: (data: Partial<BuyerFormData>) => void;
  formatPhoneNumber: (value: string) => string;
}

const PersonalInfoSection = ({ formData, onFormDataChange, formatPhoneNumber }: PersonalInfoSectionProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'mobileNumber' || name === 'businessNumber') {
      onFormDataChange({
        [name]: formatPhoneNumber(value),
      });
    } else {
      onFormDataChange({
        [name]: value,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
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
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
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
        <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
          Mobile Number
        </label>
        <Input
          id="mobileNumber"
          name="mobileNumber"
          type="tel"
          required
          value={formData.mobileNumber}
          onChange={handleChange}
          placeholder="(123) 456-7890"
          maxLength={14}
        />
      </div>
      <div>
        <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700">
          Business Number
        </label>
        <Input
          id="businessNumber"
          name="businessNumber"
          type="tel"
          required
          value={formData.businessNumber}
          onChange={handleChange}
          placeholder="(123) 456-7890"
          maxLength={14}
        />
      </div>
    </div>
  );
};

export default PersonalInfoSection;
