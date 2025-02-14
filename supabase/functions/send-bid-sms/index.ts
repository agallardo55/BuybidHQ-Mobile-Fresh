
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import twilio from "npm:twilio@4.19.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BidSMSRequest {
  type: 'bid_response'
  phoneNumber: string
  vehicleDetails: {
    year: string
    make: string
    model: string
  }
  offerAmount: string
  buyerName: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, phoneNumber, vehicleDetails, offerAmount, buyerName } = await req.json() as BidSMSRequest

    if (type !== 'bid_response') {
      throw new Error('Invalid notification type')
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error('Missing Twilio configuration')
    }

    const client = twilio(accountSid, authToken)
    const { year, make, model } = vehicleDetails
    
    const message = `New bid received for your ${year} ${make} ${model}! ${buyerName} has offered $${offerAmount}. Log in to review and respond to this offer.`

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
