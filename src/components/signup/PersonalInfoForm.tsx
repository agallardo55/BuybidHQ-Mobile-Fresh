
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PersonalInfoFormProps {
  formData: {
    fullName: string;
    email: string;
    password: string;
    mobileNumber: string;
    businessNumber: string;
  };
  onNext: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PersonalInfoForm = ({ formData, onNext, onChange }: PersonalInfoFormProps) => {
  return (
    <div className="space-y-4">
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
          onChange={onChange}
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
          onChange={onChange}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
          placeholder="(123) 456-7890"
          maxLength={14}
        />
      </div>
      <Button
        type="button"
        onClick={onNext}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        Next Step
      </Button>
    </div>
  );
};

export default PersonalInfoForm;
