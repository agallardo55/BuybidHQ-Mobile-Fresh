
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CarrierValidationRequest {
  user_id: string;
  phone_number: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request body
    const { user_id, phone_number } = await req.json() as CarrierValidationRequest

    // Basic validation
    if (!user_id || !phone_number) {
      throw new Error('User ID and phone number are required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Call the carrier detection function
    const { data: carrierInfo, error: carrierError } = await supabase
      .rpc('get_carrier_for_validated_number', {
        p_user_id: user_id,
        p_phone_number: phone_number
      })

    if (carrierError) throw carrierError

    // Get first result since the function returns a table
    const result = Array.isArray(carrierInfo) ? carrierInfo[0] : null

    if (!result) {
      throw new Error('Failed to get carrier information')
    }

    // Return carrier detection results
    return new Response(
      JSON.stringify({
        carrier: result.carrier,
        number_type: result.number_type,
        area_code: result.area_code,
        is_valid: result.is_valid
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in validate-carrier function:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred during carrier validation'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

