
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@2.0.0"
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
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Processing contact form submission')

    const { name, email, message, inquiryType } = await req.json() as ContactFormRequest

    // Validate required fields
    if (!name || !email || !message || !inquiryType) {
      throw new Error('Missing required fields')
    }

    console.log('Received form data:', {
      type: 'contact_form',
      email,
      testMode: IS_TEST_MODE
    })

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store the submission in the database
    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert([{ 
        name, 
        email, 
        message, 
        inquiry_type: inquiryType 
      }])

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to store contact submission',
          details: dbError.message 
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

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    // In test mode, override the recipient email with the test email
    const toEmail = IS_TEST_MODE ? TEST_EMAIL : email
    const subject = `${IS_TEST_MODE ? '[TEST MODE] ' : ''}New Contact Form Submission - ${inquiryType}`

    console.log('Sending email:', {
      to: toEmail,
      subject,
      testMode: IS_TEST_MODE
    })

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [toEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2>New Contact Form Submission</h2>
          <p>A new contact form submission has been received:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Contact Details:</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Inquiry Type:</strong> ${inquiryType}</li>
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>Email:</strong> ${email}</li>
            </ul>
          </div>
          <div style="margin-top: 20px;">
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p>Best regards,<br>BuyBid HQ Team</p>
        </div>
      `,
    })

    if (error) {
      console.error('Email sending error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email notification',
          details: error.message 
        }), 
        { 
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
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
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in send-contact-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process contact form submission',
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
