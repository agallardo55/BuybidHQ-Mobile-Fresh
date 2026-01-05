
import { SignUpFormData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logger } from '@/utils/logger';

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
      logger.debug('Starting signup process for email:', formData.email);
      
      // Validate required fields
      if (!formData.email || !formData.password || !formData.fullName || !formData.mobileNumber || !formData.dealershipName || !formData.planType) {
        logger.error('Missing required fields:', {
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
      
      logger.debug('Calling Edge Function for user:', formData.email);
      
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
        logger.error('Edge Function invoke error:', invokeError);
        throw invokeError;
      }

      if (signupError) {
        logger.error('Edge Function error:', signupError);
        throw signupError;
      }
      
      logger.debug('Edge Function response:', signupResponse);

      if (!signupResponse?.user) {
        throw new Error('No user data returned');
      }

      const authData = {
        user: signupResponse.user,
        session: signupResponse.session,
      };
      const isRestored = signupResponse.type === 'restored';
      const isIncompleteCompleted = signupResponse.type === 'incomplete_completed';

      logger.debug('Auth data received:', { 
        userId: authData.user.id, 
        hasSession: !!authData.session,
        sessionAccessToken: authData.session?.access_token ? 'present' : 'missing'
      });

      // Set the session in the Supabase client for proper authentication
      if (authData.session) {
        logger.debug('Setting session in Supabase client...');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        });

        if (sessionError) {
          logger.error('Session error:', sessionError);
          throw new Error(`Failed to set session: ${sessionError.message}`);
        }
        logger.debug('Session set successfully');
        
        // Verify the session is actually set
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        logger.debug('Current authenticated user:', currentUser?.id);
        
        if (!currentUser) {
          throw new Error('Session was not properly set - no authenticated user found');
        }
      }

      // Step 2: Ensure buybidhq_users record exists
      // Create it if it doesn't exist (database trigger may not be set up)
      logger.debug('Ensuring buybidhq_users record exists...');

      const { data: existingUser, error: checkError } = await supabase
        .from('buybidhq_users')
        .select('id, account_id')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        logger.error('Error checking buybidhq_users:', checkError);
        throw checkError;
      }

      // If user doesn't exist, create the record
      if (!existingUser) {
        logger.debug('User not found in buybidhq_users, creating record...');
        const { error: createError } = await supabase
          .from('buybidhq_users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            mobile_number: formData.mobileNumber,
            role: 'basic',
            app_role: 'member', // Will be updated to account_admin later
            is_active: true,
            status: 'active',
          });

        if (createError) {
          logger.error('Error creating buybidhq_users record:', createError);
          throw createError;
        }
        logger.debug('buybidhq_users record created successfully');
      } else {
        logger.debug('User already exists in buybidhq_users');
      }

      // Step 3: Create or update individual dealer record for all signup users
      logger.debug('Creating individual dealer record...');
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
        logger.error('Error creating individual dealer:', individualDealerError);
        throw individualDealerError;
      }
      
      logger.debug('Individual dealer created:', individualDealerData);

      // Step 4: Update the user record
      // Note: dealership_id is NOT set for individual dealers - the individual_dealers.user_id provides the link
      logger.debug('Updating user record...');
      const { data: updatedUser, error: userError } = await supabase
        .from('buybidhq_users')
        .update({
          full_name: formData.fullName,
          mobile_number: formData.mobileNumber,
          email: formData.email,
          role: 'basic', // All signup users get basic role
          is_active: true,
          status: 'active', // User account is active immediately upon creation
          sms_consent: formData.smsConsent,
          app_role: 'account_admin', // Solo users are admins of their own account
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (userError) {
        logger.error('Error updating user:', userError);
        throw userError;
      }
      
      logger.debug('User record updated:', updatedUser);

      // Helper function to map frontend plan types to database plan types
      // Beta = free, Connect = paid monthly, Annual = paid annually
      const mapPlanToDB = (frontendPlan: string): string => {
        switch (frontendPlan) {
          case 'beta-access':
            return 'free';
          case 'connect':
            return 'connect';
          case 'annual':
            return 'connect'; // Annual is same as connect plan, just different billing cycle
          default:
            return 'free';
        }
      };

      // Helper function to determine billing cycle
      // Beta (free) = NULL, Connect = monthly, Annual = annual
      const getBillingCycle = (frontendPlan: string): string | null => {
        switch (frontendPlan) {
          case 'beta-access':
            return null; // Free plan has no billing cycle
          case 'connect':
            return 'monthly';
          case 'annual':
            return 'annual';
          default:
            return null;
        }
      };

      // Step 5: Create or reuse account (handle race conditions gracefully)
      let accountData;

      // Verify user is authenticated before account creation
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      logger.warn('Auth check result:', { authUser: authUser?.id, authError });

      if (!authUser) {
        throw new Error('No authenticated user found - cannot create account');
      }

      // Also check the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      logger.debug('Session check result:', {
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
              plan: mapPlanToDB(formData.planType || 'beta-access'),
              billing_cycle: getBillingCycle(formData.planType || 'beta-access'),
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
        logger.warn('Account creation blocked, fetching existing account:', accountError.message);
        
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
      logger.debug('Linking account to user...');
      const { error: linkError } = await supabase
        .from('buybidhq_users')
        .update({
          account_id: accountData.id, // Link to their individual account
        })
        .eq('id', authData.user.id);

      if (linkError) {
        logger.error('Error linking account to user:', linkError);
        throw linkError;
      }
      
      logger.debug('Account linked to user successfully');

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
      logger.debug('Mapping plan type:', formData.planType, '->', dbPlanType);

      // Map status based on plan type - only 'active', 'canceled', 'past_due', 'incomplete' are allowed
      const mapStatus = (frontendPlan: string) => {
        if (['connect', 'annual'].includes(frontendPlan)) {
          return 'incomplete'; // Paid plans start as incomplete until Stripe webhook confirms payment
        } else {
          return 'active'; // Beta access is immediately active (freemium model)
        }
      };

      const dbStatus = mapStatus(formData.planType || 'beta-access');
      logger.debug('Mapping status:', formData.planType, '->', dbStatus);

      const subscriptionData = {
        user_id: authData.user.id,
        plan_type: dbPlanType,
        status: dbStatus,
        is_trial: false, // No trials in freemium model
        trial_ends_at: null // No trial expiration
      };
      
      logger.debug('About to handle subscription (check existing first):', subscriptionData);

      // Check if subscription already exists for this user
      const { data: existingSubscription, error: subscriptionCheckError } = await supabase
        .from('subscriptions')
        .select('id, plan_type, status')
        .eq('user_id', authData.user.id)
        .single();

      if (subscriptionCheckError && subscriptionCheckError.code !== 'PGRST116') { // PGRST116 means no rows found
        logger.error('Error checking existing subscription:', subscriptionCheckError);
        throw subscriptionCheckError;
      }

      if (existingSubscription) {
        logger.debug('Subscription already exists, updating instead of creating:', existingSubscription);
        
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
          logger.error('Error updating subscription:', updateError);
          throw updateError;
        }
        
        logger.debug('Subscription updated successfully');
      } else {
        logger.debug('No existing subscription found, creating new one');
        
        // Create new subscription
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert([subscriptionData]);

        if (subscriptionError) {
          logger.error('Error creating subscription:', JSON.stringify(subscriptionError, null, 2));
          logger.error('Subscription data that failed:', JSON.stringify(subscriptionData, null, 2));
          throw subscriptionError;
        }
        
        logger.debug('Subscription created successfully');
      }

      // For paid plans, skip toast (they'll be redirected to Stripe immediately)
      // For free plans, show success toast before dashboard redirect
      if (['connect', 'annual'].includes(formData.planType)) {
        // Both connect and annual plans go through Stripe checkout
        logger.debug('Initiating Stripe checkout for plan:', formData.planType);
        
        // Use the signup checkout function (no authentication required)
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !anonKey) {
          throw new Error('Missing Supabase environment variables. Please check your .env file.');
        }
        
        logger.debug('Using Supabase URL:', supabaseUrl);
        logger.debug('Using Supabase Key:', anonKey ? 'present' : 'missing');
        logger.debug('Calling signup checkout function (no auth required)');
        
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
            successUrl: `${window.location.origin}/dashboard?payment=success`,
            cancelUrl: `${window.location.origin}/signup?payment=canceled`
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          logger.error('Stripe checkout response error:', response.status, errorText);
          throw new Error(`Stripe checkout failed: ${response.status} ${errorText}`);
        }

        const checkoutData = await response.json();
        logger.debug('Stripe checkout successful:', checkoutData);

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
      logger.error('Signup error:', error);
      logger.error('Signup error details:', JSON.stringify(error, null, 2));
      toast.error(error.message || error.msg || "Failed to create account");
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
  };
};
