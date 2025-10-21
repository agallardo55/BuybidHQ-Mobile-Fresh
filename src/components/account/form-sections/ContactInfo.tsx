
import { Input } from "@/components/ui/input";
import { usePhoneFormat } from "@/hooks/signup/usePhoneFormat";

interface ContactInfoProps {
  formData: {
    fullName: string;
    email: string;
    mobileNumber: string;
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
          autoComplete="name"
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
          autoComplete="email"
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
          autoComplete="tel"
        />
      </div>
    </>
  );
};
