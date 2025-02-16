
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Carrier email gateway mappings (same as in validate-phone function)
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

// Mock carrier determination function (temporary until Twilio is registered)
function determineMockCarrier(phoneNumber: string): string {
  const lastDigit = parseInt(phoneNumber.slice(-1))
  const carriers = Object.keys(CARRIER_EMAIL_GATEWAYS)
  return carriers[lastDigit % carriers.length]
}

// Format phone number to E.164
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`
  }
  return cleaned
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Call the batch processing function
    const { data: batchResult, error: batchError } = await supabase
      .rpc('process_phone_validation_batch')

    if (batchError) throw batchError

    // After validation is complete, process carrier detection
    const { data: carrierResult, error: carrierError } = await supabase
      .rpc('process_carrier_detection_batch')

    if (carrierError) throw carrierError

    // Fetch batch statistics
    const stats = {
      validation: {
        total: batchResult[0].total_processed,
        successful: batchResult[0].successful,
        failed: batchResult[0].failed
      },
      carrier: {
        processed: carrierResult[0].total_processed,
        detected: carrierResult[0].carriers_detected
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Batch processing completed',
        stats
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in batch-validate-phones function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during batch validation'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
