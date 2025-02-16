
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Carrier email gateway mappings
const CARRIER_EMAIL_GATEWAYS: Record<string, string> = {
  'Verizon Wireless': 'vtext.com',
  'AT&T': 'txt.att.net',
  'T-Mobile': 'tmomail.net',
  'Sprint': 'messaging.sprintpcs.com',
  'US Cellular': 'email.uscc.net',
  'Metro PCS': 'mymetropcs.com',
  'Boost Mobile': 'sms.myboostmobile.com',
  'Cricket': 'sms.cricketwireless.net',
  'Virgin Mobile': 'vmobl.com',
}

interface PhoneValidationRequest {
  phone_number: string;
  user_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request body
    const { phone_number, user_id } = await req.json() as PhoneValidationRequest

    // Basic validation
    if (!phone_number || !user_id) {
      throw new Error('Phone number and user ID are required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Format phone number (basic E.164 formatting)
    const formattedNumber = phone_number
      .replace(/\D/g, '')
      .replace(/^1/, '')
      .replace(/(\d{3})(\d{3})(\d{4})/, '+1$1$2$3')

    // Simulate Twilio Lookup API call while waiting for registration
    // This will be replaced with actual Twilio API call once registered
    const carrierInfo = {
      carrier: {
        name: determineMockCarrier(formattedNumber),
        type: 'mobile',
      },
      valid: true,
    }

    // Get email gateway domain for carrier
    const emailGateway = CARRIER_EMAIL_GATEWAYS[carrierInfo.carrier.name]
    const smsEmail = emailGateway ? `${formattedNumber.slice(2)}@${emailGateway}` : null

    // Update user record with validation results
    const { error: updateError } = await supabase
      .from('buybidhq_users')
      .update({
        phone_carrier: carrierInfo.carrier.name,
        phone_validated: carrierInfo.valid,
        phone_validation_date: new Date().toISOString(),
        phone_type: carrierInfo.carrier.type,
      })
      .eq('id', user_id)

    if (updateError) {
      throw updateError
    }

    // Return validation results
    return new Response(
      JSON.stringify({
        valid: carrierInfo.valid,
        carrier: carrierInfo.carrier.name,
        type: carrierInfo.carrier.type,
        sms_email: smsEmail,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in validate-phone function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during phone validation',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Mock carrier determination function (temporary until Twilio is registered)
function determineMockCarrier(phoneNumber: string): string {
  // Simple mock carrier assignment based on last digit
  const lastDigit = parseInt(phoneNumber.slice(-1))
  const carriers = Object.keys(CARRIER_EMAIL_GATEWAYS)
  return carriers[lastDigit % carriers.length]
}
