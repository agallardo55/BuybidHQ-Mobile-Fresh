
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

      // Both individual and pay-per-bid plans use individual_dealers table
      if (formData.planType === 'individual' || formData.planType === 'pay-per-bid') {
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
        // Only multi-user dealerships use the dealerships table
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

      // Step 4: Update the user record - both individual and pay-per-bid get 'individual' role
      const { data: updatedUser, error: userError } = await supabase
        .from('buybidhq_users')
        .update({
          full_name: formData.fullName,
          mobile_number: formData.mobileNumber,
          email: formData.email,
          role: formData.planType === 'beta-access' ? 'basic' : 'individual',
          dealership_id: dealershipId,
          address: formData.dealershipAddress,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          is_active: true,
          status: ['individual', 'pay-per-bid'].includes(formData.planType) ? 'pending_payment' : 'active',
          sms_consent: formData.smsConsent,
          app_role: dealershipId ? 'account_admin' : 'member', // First user in dealership becomes account admin
          ...(formData.carrier ? { phone_carrier: formData.carrier } : {})
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (userError) {
        throw userError;
      }

      // Step 4.5: If this is a multi-user dealership, make the user an account admin
      if (dealershipId && updatedUser.account_id) {
        const { error: accountAdminError } = await supabase
          .from('account_administrators')
          .insert({
            user_id: authData.user.id,
            account_id: updatedUser.account_id,
            email: formData.email,
            full_name: formData.fullName,
            mobile_number: formData.mobileNumber,
            status: 'active',
            granted_by: authData.user.id, // Self-granted during signup
            granted_at: new Date().toISOString()
          });

        if (accountAdminError && !accountAdminError.message.includes('duplicate key')) {
          console.error('Account admin creation error:', accountAdminError);
        }
      }

      // Step 5: Create subscription record with appropriate payment type
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: authData.user.id,
            plan_type: formData.planType || 'beta-access',
            status: ['individual', 'pay-per-bid'].includes(formData.planType) ? 'pending' : 'trialing',
            is_trial: !['individual', 'pay-per-bid'].includes(formData.planType),
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (subscriptionError) {
        throw subscriptionError;
      }

      toast.success("Account created successfully!");
      
      if (['individual', 'pay-per-bid'].includes(formData.planType)) {
        // Both individual and pay-per-bid plans go through Stripe checkout
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
        // For beta-access plans, go to signin
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
