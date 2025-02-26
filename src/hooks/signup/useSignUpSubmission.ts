
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
            plan_type: formData.planType,
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
              dealer_type: 'multi_user',
              is_active: true,
            }
          ])
          .select()
          .single();

        if (dealershipError) {
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
          status: formData.planType === 'individual' ? 'pending_payment' : 'active',
          sms_consent: formData.smsConsent,
          ...(formData.carrier ? { phone_carrier: formData.carrier } : {})
        })
        .eq('id', authData.user.id);

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
            status: formData.planType === 'individual' ? 'pending' : 'trialing',
            is_trial: formData.planType !== 'individual',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
            cancelUrl: `${window.location.origin}/account?canceled=true`,
            customer: {
              email: formData.email,
              name: formData.fullName
            }
          }
        });

        if (checkoutError) {
          console.error('Checkout error:', checkoutError);
          throw new Error('Failed to initiate checkout. Please try again or contact support.');
        }

        if (!checkoutData?.url) {
          throw new Error('No checkout URL returned');
        }

        // Redirect to Stripe checkout
        window.location.href = checkoutData.url;
      } else {
        // For other plans, go to signin
        toast.success("Welcome to BuybidHQ! You can now sign in to your account.");
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
