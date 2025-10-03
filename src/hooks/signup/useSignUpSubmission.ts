
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
          emailRedirectTo: `${window.location.origin}/dashboard`,
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

      // Step 2: Create individual dealer record for all signup users
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

      // Step 3: Create individual account for this user
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .insert([
          {
            name: formData.dealershipName,
            plan: formData.planType === 'beta-access' ? 'free' : 
                  formData.planType === 'individual' ? 'connect' : 'free',
            seat_limit: 1,
            feature_group_enabled: false
          }
        ])
        .select()
        .single();

      if (accountError) {
        throw accountError;
      }

      // Step 4: Update the user record - all signup users get basic role and member app_role
      const { data: updatedUser, error: userError } = await supabase
        .from('buybidhq_users')
        .update({
          full_name: formData.fullName,
          mobile_number: formData.mobileNumber,
          email: formData.email,
          role: 'basic', // All signup users get basic role
          account_id: accountData.id, // Link to their individual account
          address: formData.dealershipAddress,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          is_active: true,
          status: ['individual', 'pay-per-bid'].includes(formData.planType) ? 'pending_payment' : 'active',
          sms_consent: formData.smsConsent,
          app_role: 'member', // All signup users are individual dealers with member role
          ...(formData.carrier ? { phone_carrier: formData.carrier } : {})
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (userError) {
        throw userError;
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
        // For beta-access plans, go to dashboard
        toast.success("Welcome to BuybidHQ!");
        navigate('/dashboard');
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
