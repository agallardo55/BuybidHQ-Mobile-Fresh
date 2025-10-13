import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignupData {
  email: string;
  password: string;
  fullName: string;
  mobileNumber: string;
  dealershipAddress: string;
  city: string;
  state: string;
  zipCode: string;
  planType: string;
  smsConsent: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signupData: SignupData = await req.json();

    console.log('Processing signup/restore for email:', signupData.email);

    // First, check if this is a deleted user trying to restore
    const { data: restoreResult, error: restoreError } = await supabase.rpc(
      'restore_deleted_account',
      {
        p_email: signupData.email,
        p_full_name: signupData.fullName,
        p_mobile_number: signupData.mobileNumber,
        p_address: signupData.dealershipAddress,
        p_city: signupData.city,
        p_state: signupData.state,
        p_zip_code: signupData.zipCode,
        p_sms_consent: signupData.smsConsent,
      }
    );

    if (restoreError) {
      console.error('Restore check error:', restoreError);
      throw new Error(`Failed to check restoration status: ${restoreError.message}`);
    }

    const restoredUser = Array.isArray(restoreResult) ? restoreResult[0] : restoreResult;

    // If user was restored
    if (restoredUser?.was_restored) {
      console.log('User restored successfully:', restoredUser.user_id);
      console.log('Auth user exists:', restoredUser.auth_user_exists);

      // Check if auth user still exists
      if (!restoredUser.auth_user_exists) {
        // Auth user was deleted - create new auth user with same ID
        console.log('Auth user not found, creating new auth user with ID:', restoredUser.user_id);
        
        const { error: createError } = await supabase.auth.admin.createUser({
          id: restoredUser.user_id,
          email: signupData.email,
          password: signupData.password,
          email_confirm: true,
          user_metadata: {
            full_name: signupData.fullName,
            plan_type: signupData.planType,
          },
        });

        if (createError) {
          console.error('Auth user creation error:', createError);
          throw new Error(`Failed to create auth user: ${createError.message}`);
        }
      } else {
        // Auth user exists - just update the password
        console.log('Auth user exists, updating password');
        
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          restoredUser.user_id,
          { password: signupData.password }
        );

        if (passwordError) {
          console.error('Password update error:', passwordError);
          throw new Error(`Failed to update password: ${passwordError.message}`);
        }
      }

      // Sign in the user to get a session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: signupData.email,
        password: signupData.password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw new Error(`Failed to sign in restored user: ${signInError.message}`);
      }

      return new Response(
        JSON.stringify({
          type: 'restored',
          user: signInData.user,
          session: signInData.session,
          message: 'Account restored successfully',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Not a deleted user, proceed with normal signup
    console.log('New user signup:', signupData.email);

    // Check if user already exists in auth system
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users.some(u => u.email === signupData.email);
    
    if (userExists) {
      console.log('User already exists, attempting sign in:', signupData.email);
      
      // Try to sign in with provided credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: signupData.email,
        password: signupData.password,
      });

      if (signInError) {
        console.error('Sign in failed for existing user:', signInError);
        throw new Error('An account with this email already exists. Please use the sign in page instead.');
      }

      console.log('Existing user signed in successfully');
      
      return new Response(
        JSON.stringify({
          type: 'existing',
          user: signInData.user,
          session: signInData.session,
          message: 'Signed in successfully',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        emailRedirectTo: `${req.headers.get('origin') || 'http://localhost:8080'}/dashboard`,
        data: {
          full_name: signupData.fullName,
          plan_type: signupData.planType,
        },
      },
    });

    if (authError) {
      console.error('Signup error:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No user data returned from signup');
    }

    console.log('New user created successfully:', authData.user.id);

    return new Response(
      JSON.stringify({
        type: 'new',
        user: authData.user,
        session: authData.session,
        message: 'Account created successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in handle-signup-or-restore:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process signup/restore' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
