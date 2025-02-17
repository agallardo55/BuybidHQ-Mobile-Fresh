
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PersonalInfoFormProps {
  formData: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    mobileNumber: string;
    businessNumber: string;
  };
  onNext: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
}

const PersonalInfoForm = ({ formData, onNext, onChange, onBack }: PersonalInfoFormProps) => {
  const passwordsMatch = formData.password === formData.confirmPassword;
  const showMismatchError = formData.confirmPassword.length > 0 && !passwordsMatch;

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
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
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
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={showMismatchError}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
