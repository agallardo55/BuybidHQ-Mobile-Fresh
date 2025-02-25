
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SignUpFormData } from "./types";

interface UseSignUpSubmissionProps {
  formData: SignUpFormData;
  setIsSubmitting: (value: boolean) => void;
}

export const useSignUpSubmission = ({
  formData,
  setIsSubmitting,
}: UseSignUpSubmissionProps) => {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.smsConsent) {
      toast.error("Please agree to receive SMS messages to continue");
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Sign up the user
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

      // Step 2: Wait briefly for the trigger to create the initial user record
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Create dealership record
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

      // Step 4: Upsert the user record instead of update
      const { error: userError } = await supabase
        .from('buybidhq_users')
        .upsert({
          id: authData.user.id,
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
        });

      if (userError) {
        throw userError;
      }

      // Step 5: Create subscription record
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
    handleSubmit,
  };
};
