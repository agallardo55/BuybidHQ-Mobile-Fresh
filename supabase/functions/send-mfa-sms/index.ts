import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSMFARequest {
  method: 'sms';
  phoneNumber: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!supabaseUrl || !supabaseServiceKey || !twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
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

    const { method, phoneNumber }: SMSMFARequest = await req.json();

    console.log('Creating MFA verification for SMS:', { userId: user.id, phoneNumber });

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

    console.log('MFA verification created, sending SMS');

    // Format phone number for Twilio (+1 prefix for US numbers)
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '+1' + formattedPhone;
    } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
      formattedPhone = '+' + formattedPhone;
    } else {
      throw new Error('Invalid phone number format');
    }

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    
    const twilioBody = new URLSearchParams({
      From: twilioPhoneNumber,
      To: formattedPhone,
      Body: `Your BuybidHQ MFA verification code is: ${verificationCode}. This code expires in 5 minutes.`
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: twilioBody
    });

    if (!twilioResponse.ok) {
      const twilioError = await twilioResponse.text();
      console.error('Twilio error:', twilioError);
      throw new Error('Failed to send SMS verification code');
    }

    console.log('SMS MFA verification sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS verification code sent successfully' 
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
    console.error('Error in send-mfa-sms function:', error);
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