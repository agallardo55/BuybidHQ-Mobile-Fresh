
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import twilio from "npm:twilio@4.19.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BaseSMSRequest {
  type: 'bid_request' | 'bid_response'
  phoneNumber: string
  vehicleDetails: {
    year: string
    make: string
    model: string
  }
}

interface BidRequestSMS extends BaseSMSRequest {
  type: 'bid_request'
  bidRequestUrl: string
}

interface BidResponseSMS extends BaseSMSRequest {
  type: 'bid_response'
  offerAmount: string
  buyerName: string
}

type SMSRequest = BidRequestSMS | BidResponseSMS

function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if number is valid (10 digits for US numbers)
  if (cleaned.length !== 10) {
    throw new Error(`Invalid phone number length: ${cleaned.length} digits. Expected 10 digits.`);
  }
  
  // Add +1 for US numbers
  return `+1${cleaned}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json() as SMSRequest
    const { type, phoneNumber, vehicleDetails } = requestData

    console.log('Processing SMS request:', {
      type,
      phoneNumber,
      vehicleDetails
    });

    // Get Twilio credentials from environment variables
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    // Add more detailed error logging
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error('Missing Twilio configuration:', {
        hasAccountSid: !!accountSid,
        hasAuthToken: !!authToken,
        hasPhoneNumber: !!twilioPhoneNumber
      });
      throw new Error('Missing Twilio configuration. Please ensure all required environment variables are set.')
    }

    // Format the Twilio phone number
    const formattedTwilioNumber = formatPhoneNumber(twilioPhoneNumber);
    console.log('Formatted Twilio number:', formattedTwilioNumber);

    // Format the recipient's phone number
    const formattedRecipientNumber = formatPhoneNumber(phoneNumber);
    console.log('Formatted recipient number:', formattedRecipientNumber);

    const client = twilio(accountSid, authToken)
    const { year, make, model } = vehicleDetails
    
    let message: string

    if (type === 'bid_request') {
      message = `New bid request for your ${year} ${make} ${model}! Click here to submit your offer: ${requestData.bidRequestUrl}`
    } else if (type === 'bid_response') {
      message = `New bid received for your ${year} ${make} ${model}! ${requestData.buyerName} has offered $${requestData.offerAmount}. Log in to review and respond to this offer.`
    } else {
      throw new Error('Invalid notification type')
    }

    console.log('Sending SMS with message:', message);

    // Send the message with formatted phone numbers
    const twilioResponse = await client.messages.create({
      body: message,
      to: formattedRecipientNumber,
      from: formattedTwilioNumber,
    })

    console.log('Twilio response:', {
      sid: twilioResponse.sid,
      status: twilioResponse.status,
      errorMessage: twilioResponse.errorMessage,
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        messageId: twilioResponse.sid,
        status: twilioResponse.status
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in send-bid-sms function:', error);
    
    // Determine if it's a phone number formatting error
    const errorMessage = error.message.includes('Invalid phone number') 
      ? error.message 
      : 'Failed to send SMS. Please try again.';

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
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
