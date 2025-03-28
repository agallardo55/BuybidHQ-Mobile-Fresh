
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/deploy/docs/netlify
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, offerAmount } = await req.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'No token provided' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }
    
    if (!offerAmount || isNaN(offerAmount) || offerAmount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid offer amount' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate token and check expiration
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('bid_submission_tokens')
      .select('id, buyer_id, bid_request_id, is_used, expires_at')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    const expiryDate = new Date(tokenData.expires_at);
    const now = new Date();

    if (expiryDate < now) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token has expired' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    if (tokenData.is_used) {
      // Check if there's an existing bid from this buyer
      const { data: existingBid } = await supabaseAdmin
        .from('bid_responses')
        .select('id, offer_amount')
        .eq('bid_request_id', tokenData.bid_request_id)
        .eq('buyer_id', tokenData.buyer_id)
        .single();

      if (existingBid) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `You have already submitted a bid of $${existingBid.offer_amount}`,
            existingBidAmount: existingBid.offer_amount
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
        );
      }
    }

    // Insert bid response
    const { data: bidResponseData, error: bidResponseError } = await supabaseAdmin
      .from('bid_responses')
      .insert({
        bid_request_id: tokenData.bid_request_id,
        buyer_id: tokenData.buyer_id,
        offer_amount: offerAmount,
        status: 'pending'
      })
      .select('id')
      .single();

    if (bidResponseError) {
      console.error('Error creating bid response:', bidResponseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create bid response' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    // Mark token as used
    await supabaseAdmin
      .from('bid_submission_tokens')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    return new Response(
      JSON.stringify({ success: true, data: { bidResponseId: bidResponseData.id } }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    );
  } catch (error) {
    console.error('Error processing bid submission:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Server error' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});
