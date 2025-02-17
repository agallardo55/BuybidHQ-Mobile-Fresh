
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactFormRequest {
  name: string;
  email: string;
  message: string;
  inquiryType: string;
}

// For testing, we'll send all emails to this address until domain is verified
const TEST_EMAIL = 'adam@cmigpartners.com'
const IS_TEST_MODE = true // Set this to false once domain is verified

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Processing contact form submission')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    const { name, email, message, inquiryType } = await req.json() as ContactFormRequest

    console.log('Received form data:', {
      name,
      email: IS_TEST_MODE ? `${email} (will be sent to ${TEST_EMAIL})` : email,
      inquiryType,
      testMode: IS_TEST_MODE
    })

    // Store the submission in the database
    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert([{ name, email, message, inquiryType }])

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Database error: ${dbError.message}`)
    }

    console.log('Successfully stored submission in database')

    // In test mode, override the recipient email with the test email
    const toEmail = IS_TEST_MODE ? TEST_EMAIL : email
    const subject = `${IS_TEST_MODE ? '[TEST MODE] ' : ''}New ${inquiryType} Contact Form Submission`

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [toEmail],
      subject: subject,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })

    if (error) {
      console.error('Email sending error:', error)
      throw error
    }

    console.log('Email sent successfully:', {
      emailId: data?.id,
      testMode: IS_TEST_MODE,
      originalRecipient: email,
      actualRecipient: toEmail
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        emailId: data?.id,
        testMode: IS_TEST_MODE,
        originalRecipient: email,
        actualRecipient: toEmail
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-contact-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
