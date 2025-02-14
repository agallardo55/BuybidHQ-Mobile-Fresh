
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import twilio from 'npm:twilio'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type NotificationType = 'bid_request' | 'bid_response';

interface SMSPayload {
  type: NotificationType;
  phoneNumber: string;
  vehicleDetails?: {
    year: string;
    make: string;
    model: string;
  };
  // For bid requests
  bidRequestUrl?: string;
  // For bid responses
  offerAmount?: string;
  buyerName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload: SMSPayload = await req.json()

    // Validate input
    if (!payload.phoneNumber || !payload.type) {
      throw new Error('Phone number and notification type are required')
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    // Validate Twilio configuration
    if (!accountSid || !authToken || !fromNumber) {
      console.error('Missing Twilio configuration:', {
        hasAccountSid: !!accountSid,
        hasAuthToken: !!authToken,
        hasFromNumber: !!fromNumber
      })
      throw new Error('Twilio configuration is incomplete')
    }

    // Log Twilio configuration (without sensitive data)
    console.log('Twilio Configuration:', {
      accountSid: accountSid.substring(0, 5) + '...',
      fromNumber
    })

    // Initialize Twilio client with full configuration
    const client = twilio(accountSid, authToken)

    let messageBody: string;

    // Construct message based on notification type
    if (payload.type === 'bid_request') {
      if (!payload.bidRequestUrl || !payload.vehicleDetails) {
        throw new Error('Bid request URL and vehicle details are required for bid request notifications')
      }
      messageBody = `You have a new bid request to review for a ${payload.vehicleDetails.year} ${payload.vehicleDetails.make} ${payload.vehicleDetails.model}. Submit your offer here: ${payload.bidRequestUrl}`;
    } else {
      if (!payload.offerAmount || !payload.buyerName || !payload.vehicleDetails) {
        throw new Error('Offer amount, buyer name, and vehicle details are required for bid response notifications')
      }
      messageBody = `New offer received for your ${payload.vehicleDetails.year} ${payload.vehicleDetails.make} ${payload.vehicleDetails.model}. Amount: $${payload.offerAmount} from ${payload.buyerName}`;
    }

    console.log('Sending SMS with message:', messageBody);
    console.log('To phone number:', payload.phoneNumber);

    // Send SMS with explicit accountSid
    const message = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: payload.phoneNumber,
      accountSid: accountSid  // Explicitly specify the accountSid
    })

    console.log('SMS sent successfully:', message.sid)

    return new Response(
      JSON.stringify({ success: true, messageId: message.sid }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error sending SMS:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
