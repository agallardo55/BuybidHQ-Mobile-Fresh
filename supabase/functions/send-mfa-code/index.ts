import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('=== ENVIRONMENT CHECK ===')
    console.log('SUPABASE_URL exists:', !!supabaseUrl)
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!serviceRoleKey)
    console.log('SUPABASE_SERVICE_ROLE_KEY length:', serviceRoleKey?.length || 0)
    console.log('SUPABASE_SERVICE_ROLE_KEY starts with:', serviceRoleKey?.substring(0, 20) || 'N/A')
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    // Create Supabase client with service role
    const supabaseClient = createClient(
      supabaseUrl,
      serviceRoleKey,
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

    // Get user's phone number - check user object first, then fallback to buybidhq_users
    let phoneNumber = user.phone

    if (!phoneNumber) {
      // Fallback: check buybidhq_users.mobile_number
      const { data: buybidhqUser, error: mobileError } = await supabaseClient
        .from('buybidhq_users')
        .select('mobile_number')
        .eq('id', user.id)
        .single()

      if (mobileError || !buybidhqUser?.mobile_number) {
        throw new Error('No phone number found for user')
      }

      phoneNumber = buybidhqUser.mobile_number
    }

    // RATE LIMITING: Prevent abuse - max 3 code sends per 5 minutes
    const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds
    const MAX_SENDS_PER_WINDOW = 3;
    const fiveMinutesAgo = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();

    const { data: recentSends, error: recentError } = await supabaseClient
      .from('sms_verification_codes')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false });

    if (recentError) {
      console.warn('Error checking rate limit:', recentError);
      // Don't block on rate limit check error - fail open
    } else if (recentSends && recentSends.length >= MAX_SENDS_PER_WINDOW) {
      const oldestSend = new Date(recentSends[recentSends.length - 1].created_at);
      const waitTime = Math.ceil((RATE_LIMIT_WINDOW - (Date.now() - oldestSend.getTime())) / 1000);

      console.warn(`Rate limit exceeded for user ${user.id}. ${recentSends.length} sends in last 5 minutes.`);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Too many code requests. Please wait ${waitTime} seconds before trying again.`,
          rate_limited: true,
          wait_seconds: waitTime
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429
        }
      );
    }

    console.log(`Rate limit check passed: ${recentSends?.length || 0} sends in last 5 minutes`)

    // Clean up any existing unverified codes for this user
    const { error: cleanupError } = await supabaseClient
      .from('sms_verification_codes')
      .delete()
      .eq('user_id', user.id)
      .eq('verified', false)

    if (cleanupError) {
      console.warn('Error cleaning up old codes:', cleanupError)
      // Don't throw - continue anyway
    }

    console.log('Cleaned up old verification codes for user')

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(`[send-mfa-code] Generated code for user ${user.id}: ${code}`)

    // Store code in database (expires in 15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    console.log(`[send-mfa-code] Code expires at: ${expiresAt}`)
    
    console.log('=== DATABASE INSERT DEBUG ===')
    console.log('Insert attempt for user:', user.id)
    console.log('Code to insert:', code)
    console.log('Phone number:', phoneNumber)
    console.log('Expires at:', expiresAt)
    
    const { data: insertData, error: insertError } = await supabaseClient
      .from('sms_verification_codes')
      .insert({
        user_id: user.id,
        code: code,
        phone_number: phoneNumber,
        expires_at: expiresAt,
      })
      .select()

    console.log('Insert result:', insertData)
    console.log('Insert error:', insertError)

    if (insertError) {
      console.error('FAILED to insert verification code:', insertError)
      throw new Error(`Failed to create verification code: ${insertError.message}`)
    }

    if (!insertData || insertData.length === 0) {
      console.error('Insert succeeded but no data returned')
      throw new Error('Failed to create verification code - no data returned')
    }

    console.log('Successfully stored verification code in database')

    // Send SMS via send-twilio-sms Edge Function
    const twilioResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-twilio-sms`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          type: 'test',
          phoneNumber: phoneNumber,
          message: `Your BuyBidHQ verification code is: ${code}. This code expires in 15 minutes.`,
        }),
      }
    )

    if (!twilioResponse.ok) {
      const errorText = await twilioResponse.text()
      console.error('Twilio SMS error:', errorText)
      throw new Error('Failed to send SMS')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification code sent',
        phone: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'), // Format for display
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-mfa-code:', error)
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
