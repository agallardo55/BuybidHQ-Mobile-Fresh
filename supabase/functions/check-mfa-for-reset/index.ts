import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckMFAForResetRequest {
  email: string;
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

    const { email }: CheckMFAForResetRequest = await req.json();

    console.log('Checking MFA status for password reset:', { email });

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('buybidhq_users')
      .select('id, full_name')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ 
          hasMFA: false, 
          message: 'If an account exists with this email, you will receive password reset instructions.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has any enabled MFA methods
    const { data: mfaSettings, error: mfaError } = await supabase
      .from('mfa_settings')
      .select('method, status')
      .eq('user_id', user.id)
      .eq('status', 'enabled');

    if (mfaError) {
      console.error('Error checking MFA settings:', mfaError);
      return new Response(
        JSON.stringify({ hasMFA: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hasMFA = mfaSettings && mfaSettings.length > 0;
    const mfaMethods = mfaSettings?.map(setting => setting.method) || [];

    console.log('MFA check result:', { userId: user.id, hasMFA, methods: mfaMethods });

    if (hasMFA) {
      // User has MFA enabled - they need to verify before password reset
      return new Response(
        JSON.stringify({ 
          hasMFA: true, 
          methods: mfaMethods,
          message: 'MFA verification required for password reset.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // No MFA - proceed with standard password reset
      return new Response(
        JSON.stringify({ 
          hasMFA: false,
          message: 'Standard password reset will be sent.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Error in check-mfa-for-reset function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);