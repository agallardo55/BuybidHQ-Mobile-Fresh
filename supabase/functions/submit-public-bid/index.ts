
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PublicBidSubmission {
  token: string;
  offerAmount: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestData = await req.json() as PublicBidSubmission
    const { token, offerAmount } = requestData

    console.log('Processing public bid submission:', {
      token: token.substring(0, 8) + '...',
      offerAmount
    })

    // Validate the token and get bid request details
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('validate_bid_submission_token', { p_token: token })
      .single()

    if (tokenError || !tokenData?.is_valid) {
      console.error('Token validation error:', tokenError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired submission token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { bid_request_id, buyer_id } = tokenData

    // Insert the bid response
    const { data: bidResponse, error: insertError } = await supabase
      .from('bid_responses')
      .insert({
        bid_request_id,
        buyer_id,
        offer_amount: offerAmount,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting bid response:', insertError)
      throw insertError
    }

    // Mark the token as used
    const { error: updateError } = await supabase
      .from('bid_submission_tokens')
      .update({ 
        is_used: true,
        used_at: new Date().toISOString()
      })
      .eq('token', token)

    if (updateError) {
      console.error('Error updating token status:', updateError)
      // Don't throw here as the bid was already submitted successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        bidResponseId: bidResponse.id
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in submit-public-bid function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to submit bid',
        details: error.message 
      }), 
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
