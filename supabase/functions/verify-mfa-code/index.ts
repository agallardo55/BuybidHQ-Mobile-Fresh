import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_ATTEMPTS = 5

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get code from request body
    const { code } = await req.json()
    console.log(`[verify-mfa-code] Received code from user ${user.id}: ${code}`)
    console.log(`[verify-mfa-code] Code type: ${typeof code}, length: ${code?.length}`)
    
    if (!code || code.length !== 6) {
      throw new Error('Invalid code format')
    }

    // Get most recent unverified code for this user
    const { data: verificationData, error: fetchError } = await supabaseClient
      .from('sms_verification_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !verificationData) {
      console.error(`[verify-mfa-code] No valid code found. Fetch error:`, fetchError)
      throw new Error('No valid verification code found. Please request a new code.')
    }

    console.log(`[verify-mfa-code] Found verification code in DB: ${verificationData.code}`)
    console.log(`[verify-mfa-code] Code from DB type: ${typeof verificationData.code}, length: ${verificationData.code?.length}`)
    console.log(`[verify-mfa-code] Comparing: "${code}" === "${verificationData.code}" = ${code === verificationData.code}`)

    // Check if too many attempts
    if (verificationData.attempts >= MAX_ATTEMPTS) {
      throw new Error('Too many attempts. Please request a new code.')
    }

    // Increment attempts
    const { error: updateAttemptsError } = await supabaseClient
      .from('sms_verification_codes')
      .update({ 
        attempts: verificationData.attempts + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', verificationData.id)

    if (updateAttemptsError) {
      console.error('Error updating attempts:', updateAttemptsError)
    }

    // Normalize codes to strings for comparison
    const dbCode = String(verificationData.code).trim()
    const userCode = String(code).trim()

    console.log('=== CODE COMPARISON ===')
    console.log('Database code:', dbCode, 'Type:', typeof dbCode)
    console.log('User code:', userCode, 'Type:', typeof userCode)
    console.log('Codes match:', dbCode === userCode)

    if (dbCode !== userCode) {
      const attemptsRemaining = MAX_ATTEMPTS - (verificationData.attempts + 1)
      console.error(`[verify-mfa-code] Code mismatch! Received: "${userCode}", Expected: "${dbCode}"`)
      throw new Error(`Invalid code. ${attemptsRemaining} attempts remaining.`)
    }

    console.log(`[verify-mfa-code] Code match successful!`)

    // Code is correct! Mark as verified
    const { error: markVerifiedError } = await supabaseClient
      .from('sms_verification_codes')
      .update({ 
        verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', verificationData.id)

    if (markVerifiedError) {
      console.error('Error marking code as verified:', markVerifiedError)
      throw new Error('Failed to verify code')
    }

    // Record successful MFA verification in mfa_daily_verification
    const { error: recordError } = await supabaseClient.rpc('record_mfa_verification')

    if (recordError) {
      console.error('Error recording MFA verification:', recordError)
      // Don't throw - verification already succeeded
    }

    // Clean up old codes for this user
    await supabaseClient
      .from('sms_verification_codes')
      .delete()
      .eq('user_id', user.id)
      .neq('id', verificationData.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Code verified successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in verify-mfa-code:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
