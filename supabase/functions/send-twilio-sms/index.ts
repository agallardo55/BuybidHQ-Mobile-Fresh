import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMSRequest, BidRequestSMS, BidResponseSMS, TestSMS } from "./types.ts"
import { corsHeaders, formatPhoneNumber } from "./utils.ts"

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Starting Twilio SMS request processing`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Content-Type': 'application/json',
      },
      status: 200
    });
  }

  try {
    // Parse and validate request data
    let requestData: SMSRequest;
    try {
      requestData = await req.json();
      console.log(`[${requestId}] Request data:`, JSON.stringify(requestData, null, 2));

      // Additional validation for bid request URLs
      if (requestData.type === 'bid_request') {
        const { bidRequestUrl } = requestData;
        if (!bidRequestUrl) {
          throw new Error('Bid request URL is required');
        }
        try {
          const url = new URL(bidRequestUrl);
          const token = url.searchParams.get('token');
          if (!token) {
            throw new Error('Token parameter is missing from bid request URL');
          }
          console.log(`[${requestId}] Bid request URL validation passed:`, {
            url: url.toString(),
            token: `${token.substring(0, 8)}...`
          });
        } catch (urlError) {
          throw new Error(`Invalid bid request URL: ${urlError instanceof Error ? urlError.message : 'Invalid URL format'}`);
        }
      }
    } catch (error) {
      console.error(`[${requestId}] JSON parse or validation error:`, error);
      throw new Error('Invalid request format or missing required data');
    }

    const { type, phoneNumber } = requestData;
    
    // Validate phone number presence
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    // Validate Twilio environment variables
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials are not properly configured');
    }

    // Format phone number with country code if not present
    console.log(`[${requestId}] Formatting phone number:`, phoneNumber);
    const cleanNumber = formatPhoneNumber(phoneNumber);
    const formattedRecipientNumber = '+1' + cleanNumber;

    // Prepare SMS message based on type
    let message: string;
    
    if (requestData.type === 'bid_request') {
      const { bidRequestUrl, senderName, vehicleDetails } = requestData as BidRequestSMS;
      message = `New bid request from ${senderName} for ${vehicleDetails.year} ${vehicleDetails.make} ${vehicleDetails.model}. Click: ${bidRequestUrl}`;
    } else if (requestData.type === 'bid_response') {
      const { offerAmount, buyerName, vehicleDetails } = requestData as BidResponseSMS;
      message = `${buyerName} bid $${offerAmount} for your ${vehicleDetails.year} ${vehicleDetails.make} ${vehicleDetails.model}`;
    } else {
      const { message: testMessage } = requestData as TestSMS;
      message = testMessage || 'Test message from BuyBidHQ';
    }

    console.log(`[${requestId}] Sending SMS:`, {
      to: formattedRecipientNumber,
      from: twilioPhoneNumber,
      message: message.substring(0, 50) + '...'
    });

    // Send SMS using Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formattedRecipientNumber,
        From: twilioPhoneNumber,
        Body: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] Twilio API Error:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Twilio API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`[${requestId}] SMS sent successfully:`, {
      messageId: result.sid,
      recipientNumber: formattedRecipientNumber,
      status: result.status
    });

    return new Response(
      JSON.stringify({
        success: true,
        requestId,
        messageId: result.sid,
        recipientNumber: formattedRecipientNumber,
        status: result.status
      }),
      {
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );
  } catch (error) {
    console.error(`[${requestId}] Error:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        requestId,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json'
        },
        status: 200 // Keep 200 to prevent CORS issues
      }
    );
  }
});