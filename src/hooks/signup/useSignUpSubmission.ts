
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
      console.log('Starting signup process for email:', formData.email);
      
      // Validate required fields
      if (!formData.email || !formData.password || !formData.fullName || !formData.mobileNumber || !formData.dealershipName || !formData.planType) {
        console.error('Missing required fields:', {
          email: !!formData.email,
          password: !!formData.password,
          fullName: !!formData.fullName,
          mobileNumber: !!formData.mobileNumber,
          dealershipName: !!formData.dealershipName,
          planType: !!formData.planType,
        });
        throw new Error('Missing required fields in form data');
      }
      
      // Step 1: Call edge function to handle signup or account restoration
      const requestBody = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        dealershipName: formData.dealershipName,
        planType: formData.planType,
        smsConsent: formData.smsConsent,
      };
      
      console.log('Calling Edge Function for user:', formData.email);
      
      let signupResponse, signupError;
      try {
        // Use direct fetch instead of supabase.functions.invoke to bypass JWT verification
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Missing Supabase environment variables. Please check your .env file.');
        }
        
        const response = await fetch(`${supabaseUrl}/functions/v1/handle-signup-or-restore`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        signupResponse = result;
        signupError = null;
      } catch (invokeError) {
        console.error('Edge Function invoke error:', invokeError);
        throw invokeError;
      }

      if (signupError) {
        console.error('Edge Function error:', signupError);
        throw signupError;
      }
      
      console.log('Edge Function response:', signupResponse);

      if (!signupResponse?.user) {
        throw new Error('No user data returned');
      }

      const authData = {
        user: signupResponse.user,
        session: signupResponse.session,
      };
      const isRestored = signupResponse.type === 'restored';
      const isIncompleteCompleted = signupResponse.type === 'incomplete_completed';

      console.log('Auth data received:', { 
        userId: authData.user.id, 
        hasSession: !!authData.session,
        sessionAccessToken: authData.session?.access_token ? 'present' : 'missing'
      });

      // Set the session in the Supabase client for proper authentication
      if (authData.session) {
        console.log('Setting session in Supabase client...');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error(`Failed to set session: ${sessionError.message}`);
        }
        console.log('Session set successfully');
        
        // Verify the session is actually set
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        console.log('Current authenticated user:', currentUser?.id);
        
        if (!currentUser) {
          throw new Error('Session was not properly set - no authenticated user found');
        }
      }

      // Step 2: Wait briefly for any triggers to complete
      console.log('Waiting for triggers to complete...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already has an account linked
      console.log('Checking if user exists in buybidhq_users table...');
      const { data: existingUser, error: userCheckError } = await supabase
        .from('buybidhq_users')
        .select('account_id')
        .eq('id', authData.user.id)
        .single();
        
      if (userCheckError) {
        console.error('Error checking user in buybidhq_users:', userCheckError);
        // This might be expected if the user doesn't exist yet
      } else {
        console.log('User found in buybidhq_users:', existingUser);
      }

      // Step 3: Create or update individual dealer record for all signup users
      console.log('Creating individual dealer record...');
      const { data: individualDealerData, error: individualDealerError} = await supabase
        .from('individual_dealers')
        .upsert(
          {
            user_id: authData.user.id,
            business_name: formData.dealershipName,
            business_email: formData.email, // Required field
            business_phone: formData.mobileNumber, // Optional but good to include
          },
          { 
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        )
        .select()
        .single();
        
      if (individualDealerError) {
        console.error('Error creating individual dealer:', individualDealerError);
        throw individualDealerError;
      }
      
      console.log('Individual dealer created:', individualDealerData);

      // Step 4: Update the user record first - all signup users get basic role and member app_role
      console.log('Updating user record...');
      const { data: updatedUser, error: userError } = await supabase
        .from('buybidhq_users')
        .update({
          full_name: formData.fullName,
          mobile_number: formData.mobileNumber,
          email: formData.email,
          role: 'basic', // All signup users get basic role
          is_active: true,
          status: ['connect', 'annual'].includes(formData.planType) ? 'pending_payment' : 'active',
          sms_consent: formData.smsConsent,
          app_role: 'member', // All signup users are individual dealers with member role
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (userError) {
        console.error('Error updating user:', userError);
        throw userError;
      }
      
      console.log('User record updated:', updatedUser);

      // Step 5: Create or reuse account (handle race conditions gracefully)
      let accountData;
      
      // Verify user is authenticated before account creation
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      console.log('Auth check result:', { authUser: authUser?.id, authError });
      
      if (!authUser) {
        throw new Error('No authenticated user found - cannot create account');
      }

      // Also check the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session check result:', { 
        session: session?.user?.id, 
        sessionError,
        accessToken: session?.access_token ? 'present' : 'missing'
      });
      
      try {
        // Always try to create a new account first
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

        if (accountError) throw accountError;
        accountData = newAccount;
        
      } catch (accountError: any) {
        // If RLS blocks INSERT, a concurrent request likely created the account
        // Fetch the account that was linked by the other request
        console.log('Account creation blocked, fetching existing account:', accountError.message);
        
        const { data: userWithAccount } = await supabase
          .from('buybidhq_users')
          .select('account_id')
          .eq('id', authData.user.id)
          .single();
        
        if (!userWithAccount?.account_id) {
          // No account_id found - this is a real error
          throw accountError;
        }
        
        // Fetch the existing account
        const { data: existingAccount, error: fetchError } = await supabase
          .from('accounts')
          .select()
          .eq('id', userWithAccount.account_id)
          .single();
        
        if (fetchError) throw fetchError;
        accountData = existingAccount;
      }

      // Step 6: Link the account to the user
      console.log('Linking account to user...');
      const { error: linkError } = await supabase
        .from('buybidhq_users')
        .update({
          account_id: accountData.id, // Link to their individual account
        })
        .eq('id', authData.user.id);

      if (linkError) {
        console.error('Error linking account to user:', linkError);
        throw linkError;
      }
      
      console.log('Account linked to user successfully');

      // Step 7: Create subscription record with appropriate payment type
      // Map frontend plan types to database plan types
      const mapPlanType = (frontendPlan: string) => {
        switch (frontendPlan) {
          case 'beta-access':
            return 'beta-access';
          case 'connect':
          case 'annual':
            return 'individual'; // Both connect and annual are individual plans
          default:
            return 'beta-access';
        }
      };

      const dbPlanType = mapPlanType(formData.planType || 'beta-access');
      console.log('Mapping plan type:', formData.planType, '->', dbPlanType);

      // Map status based on plan type - only 'active', 'canceled', 'past_due', 'incomplete' are allowed
      const mapStatus = (frontendPlan: string) => {
        if (['connect', 'annual'].includes(frontendPlan)) {
          return 'incomplete'; // Paid plans start as incomplete until Stripe webhook confirms payment
        } else {
          return 'active'; // Beta access is immediately active (freemium model)
        }
      };

      const dbStatus = mapStatus(formData.planType || 'beta-access');
      console.log('Mapping status:', formData.planType, '->', dbStatus);

      const subscriptionData = {
        user_id: authData.user.id,
        plan_type: dbPlanType,
        status: dbStatus,
        is_trial: false, // No trials in freemium model
        trial_ends_at: null // No trial expiration
      };
      
      console.log('About to handle subscription (check existing first):', subscriptionData);

      // Check if subscription already exists for this user
      const { data: existingSubscription, error: checkError } = await supabase
        .from('subscriptions')
        .select('id, plan_type, status')
        .eq('user_id', authData.user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error checking existing subscription:', checkError);
        throw checkError;
      }

      if (existingSubscription) {
        console.log('Subscription already exists, updating instead of creating:', existingSubscription);
        
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            plan_type: dbPlanType,
            status: dbStatus,
            is_trial: false, // No trials in freemium model
            trial_ends_at: null // No trial expiration
          })
          .eq('user_id', authData.user.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          throw updateError;
        }
        
        console.log('Subscription updated successfully');
      } else {
        console.log('No existing subscription found, creating new one');
        
        // Create new subscription
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert([subscriptionData]);

        if (subscriptionError) {
          console.error('Error creating subscription:', subscriptionError);
          throw subscriptionError;
        }
        
        console.log('Subscription created successfully');
      }

      // Show appropriate success message
      if (isRestored) {
        toast.success("Welcome back! Your account has been restored.");
      } else if (isIncompleteCompleted) {
        toast.success("Welcome back! Your signup has been completed.");
      } else {
        toast.success("Account created successfully!");
      }
      
      if (['connect', 'annual'].includes(formData.planType)) {
        // Both connect and annual plans go through Stripe checkout
        console.log('Initiating Stripe checkout for plan:', formData.planType);
        
        // Use the signup checkout function (no authentication required)
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !anonKey) {
          throw new Error('Missing Supabase environment variables. Please check your .env file.');
        }
        
        console.log('Using Supabase URL:', supabaseUrl);
        console.log('Using Supabase Key:', anonKey ? 'present' : 'missing');
        console.log('Calling signup checkout function (no auth required)');
        
        // Get current session for auth header (optional but robust)
        const { data: { session } } = await supabase.auth.getSession();
        
        // Get authenticated user ID for webhook metadata
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.id) {
          throw new Error('User not authenticated. Please try signing in again.');
        }
        
        const response = await fetch(`${supabaseUrl}/functions/v1/create-signup-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
            // Add auth header if session exists (for robustness)
            ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
          },
          body: JSON.stringify({
            planType: formData.planType,
            customerEmail: formData.email,
            customerName: formData.fullName,
            userId: user.id, // Add user ID for webhook handler
            successUrl: `${window.location.origin}/account?success=true`,
            cancelUrl: `${window.location.origin}/account?canceled=true`
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Stripe checkout response error:', response.status, errorText);
          throw new Error(`Stripe checkout failed: ${response.status} ${errorText}`);
        }

        const checkoutData = await response.json();
        console.log('Stripe checkout successful:', checkoutData);

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
