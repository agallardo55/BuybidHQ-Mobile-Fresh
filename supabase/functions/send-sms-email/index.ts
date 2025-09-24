
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSEmailRequest {
  to_number: string;
  message: string;
  carrier_email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    const { to_number, message, carrier_email } = await req.json() as SMSEmailRequest

    if (!to_number || !message || !carrier_email) {
      throw new Error('Missing required parameters')
    }

    // Send email to carrier's SMS gateway
    const { data, error } = await resend.emails.send({
      from: 'BuyBidHQ <notifications@buybidhq.com>',
      to: carrier_email,
      subject: '', // Most carriers ignore the subject
      text: message, // Plain text only for SMS
    })

    if (error) {
      throw error
    }

    console.log('SMS email sent successfully:', data)

    return new Response(
      JSON.stringify({ success: true, message: 'SMS email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-sms-email function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred while sending SMS email',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
