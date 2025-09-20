import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MFAVerificationRequest {
  method: 'email' | 'sms';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { method }: MFAVerificationRequest = await req.json();

    console.log('Creating MFA verification for email:', { userId: user.id, method });

    // Create MFA verification record
    const { data: verification, error: verificationError } = await supabase.rpc(
      'create_mfa_verification',
      {
        p_user_id: user.id,
        p_method: method
      }
    );

    if (verificationError) {
      console.error('Error creating MFA verification:', verificationError);
      throw new Error('Failed to create verification code');
    }

    const verificationData = verification[0];
    const verificationCode = verificationData.code;

    console.log('MFA verification created, sending email');

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'BuybidHQ <noreply@resend.dev>',
        to: [user.email!],
        subject: 'Your BuybidHQ MFA Verification Code',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #333; text-align: center;">BuybidHQ MFA Verification</h1>
            <p style="font-size: 16px; color: #666; text-align: center;">
              Your multi-factor authentication verification code is:
            </p>
            <div style="background: #f5f5f5; border: 2px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 4px;">${verificationCode}</span>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center;">
              This code expires in 5 minutes. Do not share this code with anyone.
            </p>
          </div>
        `
      })
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error('Resend error:', emailError);
      throw new Error('Failed to send verification email');
    }

    console.log('Email MFA verification sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email verification code sent successfully' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in create-mfa-verification function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);