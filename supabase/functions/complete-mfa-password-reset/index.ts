import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompleteMFAPasswordResetRequest {
  email: string;
  verificationCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { email, verificationCode }: CompleteMFAPasswordResetRequest = await req.json();

    console.log('Completing MFA password reset verification:', { email });

    if (!email || !verificationCode) {
      return new Response(
        JSON.stringify({ error: 'Email and verification code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('buybidhq_users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the MFA code
    const { data: verificationResult, error: verifyError } = await supabase.rpc(
      'verify_mfa_code',
      {
        p_user_id: user.id,
        p_verification_code: verificationCode
      }
    );

    if (verifyError) {
      console.error('Error verifying MFA code:', verifyError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = verificationResult?.[0];
    if (!result?.is_valid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result?.error_message || 'Invalid verification code',
          attemptsRemaining: result?.attempts_remaining || 0
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // MFA verification successful - now initiate standard password reset
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://preview--buybidhq.lovable.app'}/reset-password`,
      }
    });

    if (resetError) {
      console.error('Error generating password reset link:', resetError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate reset link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('MFA password reset verification completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'MFA verification successful. Please check your email for the password reset link.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in complete-mfa-password-reset function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);