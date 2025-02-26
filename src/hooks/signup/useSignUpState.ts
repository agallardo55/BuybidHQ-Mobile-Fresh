
import { useState } from "react";
import { SignUpFormData, SignUpStep, PlanType } from "./types";
import { usePhoneFormat } from "./usePhoneFormat";

export const useSignUpState = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignUpStep>('plan');
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    carrier: undefined,
    businessNumber: "",
    dealershipName: "",
    licenseNumber: "",
    dealershipAddress: "",
    city: "",
    state: "",
    zipCode: "",
    planType: undefined,
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

  const handleStateChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      state: value,
    }));
  };

  const handleCarrierChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      carrier: value,
    }));
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
    handleStateChange,
    handleCarrierChange,
    handlePlanSelect,
  };
};
