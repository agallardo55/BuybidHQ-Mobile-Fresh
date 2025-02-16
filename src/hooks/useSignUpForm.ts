
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  mobileNumber: string;
  businessNumber: string;
  dealershipName: string;
  licenseNumber: string;
  dealershipAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export const useSignUpForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'personal' | 'dealership'>('personal');
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    password: "",
    mobileNumber: "",
    businessNumber: "",
    dealershipName: "",
    licenseNumber: "",
    dealershipAddress: "",
    city: "",
    state: "",
    zipCode: "",
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

  const handleNext = () => {
    if (formData.fullName && formData.email && formData.password && formData.mobileNumber && formData.businessNumber) {
      setCurrentStep('dealership');
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const handleBack = () => {
    setCurrentStep('personal');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Sign up the user with Supabase Auth
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

      // 2. Create the dealership record
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

      // 3. Update the user record with dealership info and role
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
          status: 'active'
        })
        .eq('id', authData.user.id);

      if (userError) {
        throw userError;
      }

      toast.success("Account created successfully!");
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
    handleNext,
    handleBack,
    handleSubmit,
  };
};
