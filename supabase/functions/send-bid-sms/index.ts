
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Twilio } from 'npm:twilio'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { phoneNumber, bidRequestUrl } = await req.json()

    // Validate input
    if (!phoneNumber || !bidRequestUrl) {
      throw new Error('Phone number and bid request URL are required')
    }

    // Initialize Twilio client
    const client = new Twilio(
      Deno.env.get('TWILIO_ACCOUNT_SID'),
      Deno.env.get('TWILIO_AUTH_TOKEN')
    )

    // Send SMS
    const message = await client.messages.create({
      body: `You have a new bid request to review: ${bidRequestUrl}`,
      from: Deno.env.get('TWILIO_PHONE_NUMBER'),
      to: phoneNumber
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
