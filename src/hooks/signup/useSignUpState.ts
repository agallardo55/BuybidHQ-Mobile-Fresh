
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SignUpFormData, SignUpStep, PlanType } from "./types";
import { usePhoneFormat } from "./usePhoneFormat";

export const useSignUpState = () => {
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan') as PlanType | null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignUpStep>(() => {
    // If plan parameter exists in URL, skip to personal info step
    return planParam && ['beta-access', 'connect', 'annual'].includes(planParam) ? 'personal' : 'plan';
  });
  const [formData, setFormData] = useState<SignUpFormData>({
    dealershipName: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    planType: planParam && ['beta-access', 'connect', 'annual'].includes(planParam) ? planParam : undefined,
    smsConsent: false
  });

  const { formatPhoneNumber } = usePhoneFormat();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'mobileNumber' || name === 'businessNumber') {
      setFormData((prev) => ({
        ...prev,
        [name]: formatPhoneNumber(value),
      }));
    } else if (name === 'smsConsent') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === 'true',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePlanSelect = (planType: PlanType) => {
    setFormData((prev) => ({
      ...prev,
      planType,
    }));
    setCurrentStep('personal');
  };

  return {
    formData,
    currentStep,
    isSubmitting,
    setIsSubmitting,
    setCurrentStep,
    handleChange,
    handlePlanSelect,
  };
};
