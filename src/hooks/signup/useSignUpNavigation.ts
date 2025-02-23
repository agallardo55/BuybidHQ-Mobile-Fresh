
import { SignUpFormData, SignUpStep } from "./types";

interface UseSignUpNavigationProps {
  formData: SignUpFormData;
  currentStep: SignUpStep;
  setCurrentStep: (step: SignUpStep) => void;
}

export const useSignUpNavigation = ({
  currentStep,
  setCurrentStep,
}: UseSignUpNavigationProps) => {
  const handleNext = () => {
    if (currentStep === 'personal') {
      setCurrentStep('dealership');
    }
  };

  const handleBack = () => {
    if (currentStep === 'dealership') {
      setCurrentStep('personal');
    } else if (currentStep === 'personal') {
      setCurrentStep('plan');
    }
  };

  return {
    handleNext,
    handleBack,
  };
};
