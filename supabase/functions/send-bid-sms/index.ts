
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json() as SMSRequest
    const { type, phoneNumber, vehicleDetails } = requestData

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error('Missing Twilio configuration')
    }

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

    await client.messages.create({
      body: message,
      to: phoneNumber,
      from: twilioPhoneNumber,
    })

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in send-bid-sms function:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
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
