
import { useSignUpState } from "./useSignUpState";
import { useSignUpNavigation } from "./useSignUpNavigation";
import { useSignUpSubmission } from "./useSignUpSubmission";

export const useSignUpForm = () => {
  const {
    formData,
    currentStep,
    isSubmitting,
    setIsSubmitting,
    setCurrentStep,
    handleChange,
    handleStateChange,
    handlePlanSelect,
  } = useSignUpState();

  const { handleNext, handleBack } = useSignUpNavigation({
    formData,
    currentStep,
    setCurrentStep,
  });

  const { handleSubmit } = useSignUpSubmission({
    formData,
    setIsSubmitting,
  });

  return {
    formData,
    currentStep,
    isSubmitting,
    handleChange,
    handleStateChange,
    handlePlanSelect,
    handleNext,
    handleBack,
    handleSubmit,
  };
};
