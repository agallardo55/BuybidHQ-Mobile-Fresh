
import { toast } from "sonner";
import { SignUpFormData, SignUpStep } from "./types";

interface UseSignUpNavigationProps {
  formData: SignUpFormData;
  currentStep: SignUpStep;
  setCurrentStep: (step: SignUpStep) => void;
}

export const useSignUpNavigation = ({
  formData,
  currentStep,
  setCurrentStep,
}: UseSignUpNavigationProps) => {
  const handleNext = () => {
    if (formData.fullName && formData.email && formData.password && formData.confirmPassword && 
        formData.mobileNumber && formData.password === formData.confirmPassword) {
      setCurrentStep('dealership');
    } else {
      toast.error("Please fill in all required fields and ensure passwords match");
    }
  };

  const handleBack = () => {
    if (currentStep === 'personal') {
      setCurrentStep('plan');
    } else if (currentStep === 'dealership') {
      setCurrentStep('personal');
    }
  };

  return {
    handleNext,
    handleBack,
  };
};
