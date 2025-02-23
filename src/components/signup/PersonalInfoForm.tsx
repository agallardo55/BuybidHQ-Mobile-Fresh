
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface PersonalInfoFormProps {
  formData: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    mobileNumber: string;
    smsConsent?: boolean;
  };
  onNext: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
}

const PersonalInfoForm = ({ formData, onNext, onChange, onBack }: PersonalInfoFormProps) => {
  const handleSmsConsentChange = (checked: boolean) => {
    onChange({
      target: {
        name: 'smsConsent',
        value: checked.toString(),
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

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
          value={formData.fullName}
          onChange={onChange}
          placeholder="John Smith"
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
          value={formData.email}
          onChange={onChange}
          placeholder="fullname@mail.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          value={formData.password}
          onChange={onChange}
          placeholder="Enter password"
        />
        <p className="mt-1 text-sm text-gray-500">
          Password must be at least 6 characters long
        </p>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={onChange}
          placeholder="Enter password"
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
          value={formData.mobileNumber}
          onChange={onChange}
          placeholder="(123) 456-7890"
          maxLength={14}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="smsConsent"
          checked={formData.smsConsent}
          onCheckedChange={handleSmsConsentChange}
        />
        <label 
          htmlFor="smsConsent" 
          className="text-sm text-gray-600 leading-none"
        >
          I agree to receive SMS messages from BuybidHQ at the number provided. Message frequency varies. Msg & data rates may apply. Reply STOP to unsubscribe.
        </label>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="button"
          onClick={onBack}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          className="w-full bg-custom-blue text-white hover:bg-custom-blue/90"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
