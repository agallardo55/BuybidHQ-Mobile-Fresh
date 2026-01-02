
import { useSignUpState } from "./signup/useSignUpState";
import { useSignUpNavigation } from "./signup/useSignUpNavigation";
import { useSignUpSubmission } from "./signup/useSignUpSubmission";

export const useSignUpForm = () => {
  const {
    formData,
    currentStep,
    isSubmitting,
    setIsSubmitting,
    setCurrentStep,
    handleChange,
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
    handlePlanSelect,
    handleNext,
    handleBack,
    handleSubmit,
  };
};
