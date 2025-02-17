
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { user_id, verification_code } = await req.json()

    // Get user's email
    const { data: userData, error: userError } = await supabaseClient
      .from('buybidhq_users')
      .select('email')
      .eq('id', user_id)
      .single()

    if (userError || !userData) {
      throw new Error('User not found')
    }

    // Log the verification code for testing
    console.log('==========================================')
    console.log('MFA Verification Code for Testing')
    console.log('==========================================')
    console.log(`Email: ${userData.email}`)
    console.log(`Code: ${verification_code}`)
    console.log('==========================================')

    return new Response(
      JSON.stringify({ message: 'Verification code logged successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-mfa-email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
