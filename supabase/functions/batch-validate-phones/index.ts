
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

    // Fetch pending validations
    const { data: pendingValidations, error: fetchError } = await supabase
      .from('phone_validation_batch_results')
      .select('*')
      .eq('status', 'pending')
      .limit(50)

    if (fetchError) throw fetchError

    const results = []
    
    // Process each pending validation
    for (const validation of pendingValidations) {
      try {
        const formattedNumber = formatPhoneNumber(validation.original_number)
        const carrierInfo = {
          carrier: {
            name: determineMockCarrier(formattedNumber),
            type: 'mobile'
          },
          valid: formattedNumber.length >= 11
        }

        // Update validation result
        const { error: updateError } = await supabase
          .from('phone_validation_batch_results')
          .update({
            formatted_number: formattedNumber,
            carrier: carrierInfo.carrier.name,
            is_valid: carrierInfo.valid,
            status: 'completed',
            validation_date: new Date().toISOString()
          })
          .eq('id', validation.id)

        if (updateError) throw updateError

        // Update user record if validation successful
        if (carrierInfo.valid) {
          const { error: userUpdateError } = await supabase
            .from('buybidhq_users')
            .update({
              phone_carrier: carrierInfo.carrier.name,
              phone_validated: true,
              phone_validation_date: new Date().toISOString(),
              phone_type: carrierInfo.carrier.type
            })
            .eq('id', validation.user_id)

          if (userUpdateError) throw userUpdateError
        }

        results.push({
          id: validation.id,
          success: true,
          number: formattedNumber,
          carrier: carrierInfo.carrier.name
        })
      } catch (error) {
        // Update validation result with error
        await supabase
          .from('phone_validation_batch_results')
          .update({
            status: 'error',
            validation_error: error.message
          })
          .eq('id', validation.id)

        results.push({
          id: validation.id,
          success: false,
          error: error.message
        })
      }
    }

    // Get updated statistics
    const { data: stats, error: statsError } = await supabase
      .from('phone_validation_batch_results')
      .select('status, is_valid')
      .filter('batch_id', 'eq', batchResult[0].batch_identifier)

    if (statsError) throw statsError

    const processedCount = stats.length
    const successCount = stats.filter(r => r.is_valid).length
    const failedCount = processedCount - successCount

    return new Response(
      JSON.stringify({
        message: 'Batch processing completed',
        processed: processedCount,
        successful: successCount,
        failed: failedCount,
        results
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
