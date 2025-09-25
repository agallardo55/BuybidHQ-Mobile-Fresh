
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { token } = await req.json()
    
    if (!token) {
      throw new Error('No reCAPTCHA token provided')
    }

    const recaptchaSecretKey = Deno.env.get('RECAPTCHA_SECRET_KEY')
    if (!recaptchaSecretKey) {
      throw new Error('reCAPTCHA secret key not configured')
    }

    // Verify the token with Google's reCAPTCHA API
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify'
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${recaptchaSecretKey}&response=${token}`,
    })

    const result = await response.json()
    console.log('reCAPTCHA verification result:', result)

    if (!result.success) {
      throw new Error('reCAPTCHA verification failed')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
