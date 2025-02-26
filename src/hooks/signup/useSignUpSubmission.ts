
import { SignUpFormData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

      let dealershipId: string | undefined;

      if (formData.planType === 'individual') {
        // Create individual dealer record
        const { data: individualDealerData, error: individualDealerError } = await supabase
          .from('individual_dealers')
          .insert([
            {
              user_id: authData.user.id,
              business_name: formData.dealershipName,
              business_phone: formData.businessNumber,
              business_email: formData.email,
              license_number: formData.licenseNumber,
              address: formData.dealershipAddress,
              city: formData.city,
              state: formData.state,
              zip_code: formData.zipCode
            }
          ])
          .select()
          .single();

        if (individualDealerError) {
          // Handle unique constraint violation for license number
          if (individualDealerError.code === '23505' && individualDealerError.message.includes('license_number')) {
            throw new Error('This License Number is already registered. Please use a different License Number or contact support.');
          }
          throw individualDealerError;
        }
      } else {
        // Create or link to multi-user dealership
        const { data: dealershipData, error: dealershipError } = await supabase
          .from('dealerships')
          .insert([
            {
              dealer_name: formData.dealershipName,
              ...(formData.licenseNumber ? { dealer_id: formData.licenseNumber } : {}),
              business_phone: formData.businessNumber,
              business_email: formData.email,
              address: formData.dealershipAddress,
              city: formData.city,
              state: formData.state,
              zip_code: formData.zipCode,
              primary_user_id: authData.user.id,
              primary_dealer_name: formData.fullName,
              primary_dealer_email: formData.email,
              primary_dealer_phone: formData.mobileNumber,
              dealer_type: 'multi_user'
            }
          ])
          .select()
          .single();

        if (dealershipError) {
          if (dealershipError.code === '23505' && dealershipError.message.includes('dealer_id')) {
            throw new Error('This Dealer ID is already registered. Please use a different Dealer ID or contact support.');
          }
          throw dealershipError;
        }

        dealershipId = dealershipData.id;
      }

      // Step 4: Update the user record
      const { error: userError } = await supabase
        .from('buybidhq_users')
        .update({
          full_name: formData.fullName,
          mobile_number: formData.mobileNumber,
          email: formData.email,
          role: formData.planType === 'individual' ? 'individual' : 'dealer',
          dealership_id: dealershipId,
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

      // Step 5: Create subscription record with trial
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: authData.user.id,
            plan_type: formData.planType || 'beta-access',
            status: formData.planType === 'individual' ? 'pending' : 'trialing',
            is_trial: formData.planType !== 'individual',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days trial
          }
        ]);

      if (subscriptionError) {
        throw subscriptionError;
      }

      toast.success("Account created successfully!");
      
      if (formData.planType === 'individual') {
        // For individual plan, redirect to checkout
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('stripe-checkout-session', {
          body: {
            currentPlan: formData.planType,
            successUrl: `${window.location.origin}/account?success=true`,
            cancelUrl: `${window.location.origin}/account?canceled=true`
          }
        });

        if (checkoutError) {
          throw checkoutError;
        }

        // Redirect to Stripe checkout
        window.location.href = checkoutData.url;
      } else {
        // For other plans, go to signin
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
