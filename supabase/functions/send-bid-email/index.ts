
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BaseEmailRequest {
  type: 'bid_request' | 'bid_response'
  email: string
  buyerName: string
  vehicleDetails: {
    year: string
    make: string
    model: string
  }
}

interface BidRequestEmail extends BaseEmailRequest {
  type: 'bid_request'
  bidRequestUrl: string
}

interface BidResponseEmail extends BaseEmailRequest {
  type: 'bid_response'
  offerAmount: string
  buyerName: string
}

type EmailRequest = BidRequestEmail | BidResponseEmail

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

// For testing, we'll send all emails to this address until domain is verified
const TEST_EMAIL = 'adam@cmigpartners.com'
const IS_TEST_MODE = true // Set to true until domain is verified

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json() as EmailRequest
    const { type, email, buyerName, vehicleDetails } = requestData

    console.log('Processing email request:', {
      type,
      email,
      vehicleDetails,
      testMode: IS_TEST_MODE
    })

    const { year, make, model } = vehicleDetails
    
    let subject: string
    let htmlContent: string

    if (type === 'bid_request') {
      subject = `New Bid Request - ${year} ${make} ${model}`
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2>New Bid Request</h2>
          <p>Hi ${buyerName},</p>
          <p>A new bid request has been submitted for your review:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Vehicle Details:</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Year:</strong> ${year}</li>
              <li><strong>Make:</strong> ${make}</li>
              <li><strong>Model:</strong> ${model}</li>
            </ul>
          </div>
          <p>Click the link below to submit your offer:</p>
          <p><a href="${requestData.bidRequestUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Submit Offer</a></p>
          <p>Best regards,<br>BuyBid HQ Team</p>
        </div>
      `
    } else if (type === 'bid_response') {
      subject = `New Bid Received - ${year} ${make} ${model}`
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2>New Bid Received</h2>
          <p>Hi ${buyerName},</p>
          <p>A new bid has been received for your vehicle:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Vehicle Details:</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Year:</strong> ${year}</li>
              <li><strong>Make:</strong> ${make}</li>
              <li><strong>Model:</strong> ${model}</li>
              <li><strong>Offer Amount:</strong> $${requestData.offerAmount}</li>
            </ul>
          </div>
          <p>Log in to your account to review and respond to this offer.</p>
          <p>Best regards,<br>BuyBid HQ Team</p>
        </div>
      `
    } else {
      throw new Error('Invalid notification type')
    }

    console.log('Sending email with subject:', subject)

    // In test mode, override the recipient email with the test email
    const toEmail = IS_TEST_MODE ? TEST_EMAIL : email

    // Add a note about test mode in the subject if we're in test mode
    const finalSubject = IS_TEST_MODE ? `[TEST MODE] ${subject}` : subject

    const emailResponse = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [toEmail],
      subject: finalSubject,
      html: htmlContent,
    })

    console.log('Email response:', emailResponse)

    return new Response(
      JSON.stringify({ 
        success: true,
        emailId: emailResponse.id,
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
    console.error('Error in send-bid-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email notification',
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
