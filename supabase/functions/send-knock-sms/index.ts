
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Knock } from "npm:@knocklabs/node"

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
  // Remove all non-digit characters
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

    console.log('Processing Knock SMS request:', {
      type,
      phoneNumber,
      vehicleDetails
    });

    // Get Knock API key from environment variables
    const knockApiKey = Deno.env.get('KNOCK_API_KEY')
    const knockWorkflowId = type === 'bid_request' 
      ? Deno.env.get('KNOCK_BID_REQUEST_WORKFLOW') 
      : Deno.env.get('KNOCK_BID_RESPONSE_WORKFLOW')

    if (!knockApiKey || !knockWorkflowId) {
      console.error('Missing Knock configuration:', {
        hasApiKey: !!knockApiKey,
        hasWorkflowId: !!knockWorkflowId
      });
      throw new Error('Missing Knock configuration. Please ensure all required environment variables are set.')
    }

    // Format the recipient's phone number
    const formattedRecipientNumber = formatPhoneNumber(phoneNumber);
    console.log('Formatted recipient number:', formattedRecipientNumber);

    // Initialize Knock client
    const knock = new Knock(knockApiKey);
    
    // Prepare recipient data
    const recipientId = `phone:${formattedRecipientNumber}`; // Use phone number as recipient ID
    
    // Prepare workflow data based on notification type
    let workflowData: Record<string, any>;
    
    if (type === 'bid_request') {
      const { bidRequestUrl } = requestData as BidRequestSMS;
      workflowData = {
        vehicle: vehicleDetails,
        bid_request_url: bidRequestUrl,
        recipient_phone: formattedRecipientNumber
      };
    } else {
      const { offerAmount, buyerName } = requestData as BidResponseSMS;
      workflowData = {
        vehicle: vehicleDetails,
        offer_amount: offerAmount,
        buyer_name: buyerName,
        recipient_phone: formattedRecipientNumber
      };
    }

    console.log('Triggering Knock workflow:', {
      workflowId: knockWorkflowId,
      recipientId,
      data: workflowData
    });

    // Trigger the Knock workflow
    const result = await knock.workflows.trigger(knockWorkflowId, {
      recipients: [recipientId],
      data: workflowData,
      actor: "system"
    });

    console.log('Knock workflow triggered successfully:', result);

    return new Response(
      JSON.stringify({ 
        success: true,
        messageId: result.workflow_runs[0].id,
        details: {
          recipients: result.workflow_runs[0].recipients,
          workflow: result.workflow_runs[0].workflow_key
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in send-knock-sms function:', error);
    
    // Enhanced error handling
    const errorMessage = error.message.includes('Invalid phone number') 
      ? error.message 
      : error.message || 'Failed to send SMS. Please try again.';

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message,
        timestamp: new Date().toISOString()
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
