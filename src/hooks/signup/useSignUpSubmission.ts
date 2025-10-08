
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
      // Step 1: Call edge function to handle signup or account restoration
      const { data: signupResponse, error: signupError } = await supabase.functions.invoke(
        'handle-signup-or-restore',
        {
          body: {
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            mobileNumber: formData.mobileNumber,
            carrier: formData.carrier,
            dealershipAddress: formData.dealershipAddress,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            planType: formData.planType,
            smsConsent: formData.smsConsent,
          },
        }
      );

      if (signupError) {
        throw signupError;
      }

      if (!signupResponse?.user) {
        throw new Error('No user data returned');
      }

      const authData = {
        user: signupResponse.user,
        session: signupResponse.session,
      };
      const isRestored = signupResponse.type === 'restored';

      // Set the session in the Supabase client for proper authentication
      if (authData.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        });

        if (sessionError) {
          throw new Error(`Failed to set session: ${sessionError.message}`);
        }
      }

      // Step 2: Wait briefly for any triggers to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already has an account linked
      const { data: existingUser } = await supabase
        .from('buybidhq_users')
        .select('account_id')
        .eq('id', authData.user.id)
        .single();

      // Step 3: Create or update individual dealer record for all signup users
      const { data: individualDealerData, error: individualDealerError } = await supabase
        .from('individual_dealers')
        .upsert(
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
          },
          { 
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        )
        .select()
        .single();

      if (individualDealerError) {
        throw individualDealerError;
      }

      // Step 4: Create or reuse account for this user
      let accountData;
      
      if (existingUser?.account_id) {
        // Restored user already has an account, fetch it
        const { data: existingAccount, error: fetchError } = await supabase
          .from('accounts')
          .select()
          .eq('id', existingUser.account_id)
          .single();
        
        if (fetchError) {
          throw fetchError;
        }
        
        // Update the existing account with new plan info
        const { data: updatedAccount, error: updateError } = await supabase
          .from('accounts')
          .update({
            name: formData.dealershipName,
            plan: formData.planType === 'beta-access' ? 'free' : formData.planType,
          })
          .eq('id', existingUser.account_id)
          .select()
          .single();
        
        if (updateError) {
          throw updateError;
        }
        
        accountData = updatedAccount;
      } else {
        // New user or restored user without account, create new account
        const { data: newAccount, error: accountError } = await supabase
          .from('accounts')
          .insert([
            {
              name: formData.dealershipName,
              plan: formData.planType === 'beta-access' ? 'free' : formData.planType,
              seat_limit: 1,
              feature_group_enabled: false
            }
          ])
          .select()
          .single();

        if (accountError) {
          throw accountError;
        }
        
        accountData = newAccount;
      }

      // Step 5: Update the user record - all signup users get basic role and member app_role
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
          status: ['connect', 'annual'].includes(formData.planType) ? 'pending_payment' : 'active',
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

      // Step 6: Create subscription record with appropriate payment type
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: authData.user.id,
            plan_type: formData.planType || 'beta-access',
            status: ['connect', 'annual'].includes(formData.planType) ? 'pending' : 'trialing',
            is_trial: !['connect', 'annual'].includes(formData.planType),
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (subscriptionError) {
        throw subscriptionError;
      }

      // Show appropriate success message
      if (isRestored) {
        toast.success("Welcome back! Your account has been restored.");
      } else {
        toast.success("Account created successfully!");
      }
      
      if (['connect', 'annual'].includes(formData.planType)) {
        // Both connect and annual plans go through Stripe checkout
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
