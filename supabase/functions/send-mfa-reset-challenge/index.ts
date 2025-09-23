import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";
import { Resend } from "npm:resend@2.0.0";

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
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const resend = new Resend(resendApiKey);

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
      // Send email with MFA code
      const emailResponse = await resend.emails.send({
        from: 'BuybidHQ Security <security@buybid-hq.com>',
        to: [email],
        subject: 'Password Reset - MFA Verification Required',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #333; text-align: center;">Password Reset Verification</h1>
            <p>Hello ${user.full_name || 'there'},</p>
            <p>You have requested to reset your password. For security, we need to verify your identity with multi-factor authentication.</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h2 style="margin: 0; color: #333;">Your verification code is:</h2>
              <p style="font-size: 24px; font-weight: bold; color: #325AE7; margin: 10px 0; letter-spacing: 3px;">${verificationCode}</p>
            </div>
            <p>This code will expire in 5 minutes. Enter it on the password reset page to continue.</p>
            <p>If you didn't request this password reset, please ignore this email and consider changing your password for security.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              This is an automated message from BuybidHQ. Please do not reply to this email.
            </p>
          </div>
        `,
      });

      if (emailResponse.error) {
        console.error('Error sending MFA email:', emailResponse.error);
        return new Response(
          JSON.stringify({ error: 'Failed to send verification email' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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