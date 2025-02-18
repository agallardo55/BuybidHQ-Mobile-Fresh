
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  businessNumber: string;
  dealershipName: string;
  licenseNumber: string;
  dealershipAddress: string;
  city: string;
  state: string;
  zipCode: string;
  planType: 'beta-access' | 'individual' | undefined;
  smsConsent: boolean;
}

export const useSignUpForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'plan' | 'personal' | 'dealership'>('plan');
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
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

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    
    if (phoneNumber.length >= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
    if (phoneNumber.length > 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    }
    if (phoneNumber.length > 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    if (phoneNumber.length > 0) {
      return `(${phoneNumber}`;
    }
    return phoneNumber;
  };

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

  const handlePlanSelect = (planType: 'beta-access' | 'individual') => {
    setFormData((prev) => ({
      ...prev,
      planType,
    }));
    setCurrentStep('personal');
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.smsConsent) {
      toast.error("Please agree to receive SMS messages to continue");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      const { data: dealershipData, error: dealershipError } = await supabase
        .from('dealerships')
        .insert([
          {
            dealer_name: formData.dealershipName,
            dealer_id: formData.licenseNumber,
            business_phone: formData.businessNumber,
            business_email: formData.email,
            address: formData.dealershipAddress,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            primary_user_id: authData.user.id,
            primary_dealer_name: formData.fullName,
            primary_dealer_email: formData.email,
            primary_dealer_phone: formData.mobileNumber
          }
        ])
        .select()
        .single();

      if (dealershipError) {
        throw dealershipError;
      }

      const { error: userError } = await supabase
        .from('buybidhq_users')
        .update({
          full_name: formData.fullName,
          mobile_number: formData.mobileNumber,
          email: formData.email,
          role: 'dealer',
          dealership_id: dealershipData.id,
          address: formData.dealershipAddress,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          is_active: true,
          status: 'active',
          sms_consent: formData.smsConsent
        })
        .eq('id', authData.user.id);

      if (userError) {
        throw userError;
      }

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: authData.user.id,
            plan_type: formData.planType || 'beta-access',
            status: formData.planType === 'individual' ? 'pending' : 'trialing'
          }
        ]);

      if (subscriptionError) {
        throw subscriptionError;
      }

      toast.success("Account created successfully!");
      
      if (formData.planType === 'individual') {
        navigate('/checkout');
      } else {
        navigate('/signin');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || "Failed to create account");
      setIsSubmitting(false);
    }
  };

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
