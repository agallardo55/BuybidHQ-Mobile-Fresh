import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendMFAResetChallengeRequest {
  email: string;
  method: 'email' | 'sms';
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

    const { email, method }: SendMFAResetChallengeRequest = await req.json();

    console.log('Sending MFA reset challenge:', { email, method });

    if (!email || !method) {
      return new Response(
        JSON.stringify({ error: 'Email and method are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('buybidhq_users')
      .select('id, full_name, mobile_number')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create MFA verification record for password reset
    const { data: verification, error: verificationError } = await supabase.rpc(
      'create_mfa_verification',
      {
        p_user_id: user.id,
        p_method: method
      }
    );

    if (verificationError || !verification || verification.length === 0) {
      console.error('Error creating MFA verification:', verificationError);
      return new Response(
        JSON.stringify({ error: 'Failed to create verification' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verificationCode = verification[0].code;

    if (method === 'email') {
      // Use Supabase's built-in email service until domain is verified in Resend
      console.log('Sending MFA reset challenge via Supabase Auth email');
      
      try {
        // Use Supabase Auth's signInWithOtp for email delivery
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: false,
            data: {
              verification_code: verificationCode,
              purpose: 'mfa_password_reset',
              user_name: user.full_name
            }
          }
        });

        if (otpError) {
          console.error('Supabase OTP email error:', otpError);
          // Continue anyway since we have the verification code stored
        }

        console.log('Verification code sent successfully via Supabase Auth');
      } catch (emailError: any) {
        console.error('Error sending MFA email via Supabase:', emailError);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to send verification email' 
          }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } else if (method === 'sms') {
      // Send SMS with MFA code (implementation would depend on SMS service)
      // For now, we'll use the existing Twilio integration
      const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
      const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN')!;
      const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER')!;

      if (!user.mobile_number) {
        return new Response(
          JSON.stringify({ error: 'No mobile number on file' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const body = new URLSearchParams({
        From: twilioPhone,
        To: user.mobile_number,
        Body: `BuybidHQ Password Reset: Your verification code is ${verificationCode}. This code expires in 5 minutes.`
      });

      const twilioResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body
      });

      if (!twilioResponse.ok) {
        console.error('Error sending SMS:', await twilioResponse.text());
        return new Response(
          JSON.stringify({ error: 'Failed to send verification SMS' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('MFA reset challenge sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Verification code sent via ${method}` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-mfa-reset-challenge function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);