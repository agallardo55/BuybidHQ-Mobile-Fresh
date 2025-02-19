
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PhoneValidationRequest {
  phone_number: string;
  buyer_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
    
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('Missing Twilio credentials')
    }

    // Get request body
    const { phone_number, buyer_id } = await req.json() as PhoneValidationRequest

    if (!phone_number) {
      throw new Error('Phone number is required')
    }

    console.log('Received phone number for validation:', phone_number);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update validation status to processing
    if (buyer_id) {
      await supabase
        .from('buyers')
        .update({ 
          phone_validation_status: 'processing',
        })
        .eq('id', buyer_id)
    }

    // Call Twilio Lookup API with properly encoded phone number
    const encodedPhoneNumber = encodeURIComponent(phone_number);
    const twilioEndpoint = `https://lookups.twilio.com/v2/PhoneNumbers/${encodedPhoneNumber}?Fields=line_type_intelligence`;
    const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    console.log('Making request to Twilio endpoint:', twilioEndpoint);

    const response = await fetch(twilioEndpoint, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twilio API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Twilio API error: ${response.statusText}`);
    }

    const lookupData = await response.json();
    console.log('Twilio Lookup response:', lookupData);

    const validationResult = {
      is_valid: true,
      line_type: lookupData.line_type_intelligence?.type || 'unknown',
      carrier: lookupData.line_type_intelligence?.carrier || null,
      is_ported: lookupData.line_type_intelligence?.ported || false,
      formatted_number: lookupData.phone_number,
    };

    // Update buyer record if buyer_id was provided
    if (buyer_id) {
      await supabase
        .from('buyers')
        .update({
          phone_validation_status: validationResult.is_valid ? 'valid' : 'invalid',
          line_type: validationResult.line_type,
          carrier_detail: validationResult.carrier,
          is_ported: validationResult.is_ported,
          standardized_phone: validationResult.formatted_number,
          phone_carrier: validationResult.carrier?.name || null,
          last_validated_at: new Date().toISOString()
        })
        .eq('id', buyer_id);
    }

    return new Response(
      JSON.stringify(validationResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in validate-phone function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during phone validation',
        is_valid: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
})
