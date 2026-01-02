
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useEmailAvailability } from "@/hooks/signup/useEmailAvailability";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface PersonalInfoFormProps {
  formData: {
    dealershipName: string;
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
  // Check email availability in real-time
  const { isChecking, isAvailable, message } = useEmailAvailability(formData.email, true);

  const handleSmsConsentChange = (checked: boolean) => {
    onChange({
      target: {
        name: 'smsConsent',
        value: checked.toString(),
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Password match validation
  const passwordsMatch = formData.password === formData.confirmPassword;
  const passwordError = formData.confirmPassword && !passwordsMatch 
    ? "Passwords do not match" 
    : "";

  // Disable submit button if email is taken, still checking, or passwords don't match
  const isFormValid = isAvailable !== false && passwordsMatch;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="dealershipName" className="block text-sm font-medium text-gray-700">
          Dealership Name
        </label>
        <Input
          id="dealershipName"
          name="dealershipName"
          type="text"
          value={formData.dealershipName}
          onChange={onChange}
          placeholder="ABC Motors Inc."
          autoComplete="organization"
        />
      </div>
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
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            placeholder="fullname@mail.com"
            autoComplete="email"
            className={`pr-10 ${
              isAvailable === false ? 'border-red-500 focus:ring-red-500' :
              isAvailable === true ? 'border-green-500 focus:ring-green-500' : ''
            }`}
          />
          {/* Status Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isChecking && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
            {!isChecking && isAvailable === true && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {!isChecking && isAvailable === false && (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
        {/* Status Message */}
        {message && (
          <div className={`mt-1 text-sm flex items-center gap-1 ${
            isAvailable === false ? 'text-red-600' :
            isAvailable === true ? 'text-green-600' :
            'text-gray-500'
          }`}>
            <span>{message}</span>
            {isAvailable === false && (
              <>
                <span className="mx-1">•</span>
                <Link 
                  to="/signin" 
                  className="font-medium underline hover:no-underline"
                >
                  Sign in instead?
                </Link>
              </>
            )}
          </div>
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
          value={formData.mobileNumber}
          onChange={onChange}
          placeholder="(123) 456-7890"
          maxLength={14}
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
          autoComplete="new-password"
        />
        <p className="mt-1 text-sm text-gray-500">
          Password must be at least 8 characters long
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
          placeholder="Confirm password"
          className={passwordError ? 'border-red-500 focus:ring-red-500' : ''}
          autoComplete="new-password"
        />
        {passwordError && (
          <p className="mt-1 text-sm text-red-600">{passwordError}</p>
        )}
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
          disabled={!isFormValid || isChecking}
        >
          {isChecking ? 'Checking...' : 'Sign up'}
        </Button>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
