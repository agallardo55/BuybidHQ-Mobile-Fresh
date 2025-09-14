
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

    console.log('Starting bid submission process:', {
      token: token ? `${token.substring(0, 8)}...` : 'missing',
      offerAmount: offerAmount || 'missing'
    });

    // Input validation
    if (!token) {
      throw new Error('Submission token is required');
    }
    if (typeof offerAmount !== 'number' || isNaN(offerAmount) || offerAmount <= 0) {
      throw new Error('Valid offer amount is required');
    }

    // Validate the token and get bid request details
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('validate_bid_submission_token', { p_token: token })

    if (tokenError) {
      console.error('Token validation error:', tokenError)
      throw new Error(tokenError.message || 'Token validation failed');
    }

    if (!tokenData?.[0]) {
      throw new Error('Invalid token data returned');
    }

    const validationResult = tokenData[0];
    console.log('Token validation result:', {
      isValid: validationResult.is_valid,
      hasExistingBid: validationResult.has_existing_bid
    });

    if (!validationResult.is_valid) {
      throw new Error(
        validationResult.has_existing_bid 
          ? `You have already submitted a bid of $${validationResult.existing_bid_amount}`
          : 'Invalid or expired submission token'
      );
    }

    const { bid_request_id, buyer_id } = validationResult;

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
      throw new Error(insertError.message || 'Failed to submit bid');
    }

    console.log('Successfully created bid response:', bidResponse.id);

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

    // Get notification details for SMS
    const { data: notificationDetails, error: detailsError } = await supabase
      .rpc('get_bid_notification_details', { 
        p_bid_response_id: bidResponse.id 
      })

    if (!detailsError && notificationDetails?.[0]) {
      const details = notificationDetails[0];

      // Send SMS notification to the bid request creator
      try {
        await supabase.functions.invoke('send-twilio-sms', {
          body: {
            type: 'bid_response',
            phoneNumber: details.creator_phone,
            vehicleDetails: {
              year: details.vehicle_year,
              make: details.vehicle_make,
              model: details.vehicle_model
            },
            buyerName: details.buyer_name,
            offerAmount: details.offer_amount.toLocaleString()
          }
        });
      } catch (smsError) {
        console.error('Error sending SMS notification:', smsError);
        // Don't fail the request if SMS fails
      }
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
        error: error.message || 'Failed to submit bid',
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
