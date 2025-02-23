
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
  const passwordsMatch = formData.password === formData.confirmPassword;
  const showMismatchError = formData.confirmPassword.length > 0 && !passwordsMatch;

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
        <PasswordInput
          id="password"
          name="password"
          required
          value={formData.password}
          onChange={onChange}
          minLength={6}
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
          required
          value={formData.confirmPassword}
          onChange={onChange}
          className={cn(
            showMismatchError && "border-red-500 focus:ring-red-500 focus-visible:ring-red-500"
          )}
          minLength={6}
        />
        {showMismatchError && (
          <p className="mt-1 text-sm text-red-500">
            Passwords do not match
          </p>
        )}
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
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="smsConsent"
          checked={formData.smsConsent}
          onCheckedChange={handleSmsConsentChange}
          required
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
          className="w-full bg-white text-primary hover:bg-gray-100"
          disabled={showMismatchError}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
