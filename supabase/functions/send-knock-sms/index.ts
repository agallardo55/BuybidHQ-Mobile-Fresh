
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Knock } from "npm:@knocklabs/node"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BaseSMSRequest {
  type: 'bid_request' | 'bid_response' | 'test'
  phoneNumber: string
  vehicleDetails?: {
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

interface TestSMS extends BaseSMSRequest {
  type: 'test'
  message?: string
}

type SMSRequest = BidRequestSMS | BidResponseSMS | TestSMS

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

async function verifyKnockConfiguration(knock: Knock, workflowId: string) {
  try {
    console.log('Verifying Knock configuration...');
    const workflow = await knock.workflows.get(workflowId);
    console.log('Workflow verification successful:', {
      id: workflow.id,
      name: workflow.name,
      active: workflow.active
    });
    return true;
  } catch (error) {
    console.error('Knock configuration verification failed:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Processing new request`);

  try {
    const startTime = performance.now();
    const requestData = await req.json() as SMSRequest;
    const { type, phoneNumber } = requestData;

    console.log(`[${requestId}] Processing ${type} SMS request:`, {
      type,
      phoneNumber: phoneNumber.slice(-4).padStart(phoneNumber.length, '*'),
      requestData
    });

    // Get Knock API key and workflow ID from environment variables
    const knockApiKey = Deno.env.get('KNOCK_API_KEY')
    const knockWorkflowId = type === 'bid_request' 
      ? Deno.env.get('KNOCK_BID_REQUEST_WORKFLOW')
      : type === 'bid_response'
      ? Deno.env.get('KNOCK_BID_RESPONSE_WORKFLOW')
      : Deno.env.get('KNOCK_TEST_WORKFLOW')

    if (!knockApiKey || !knockWorkflowId) {
      console.error(`[${requestId}] Missing Knock configuration:`, {
        hasApiKey: !!knockApiKey,
        hasWorkflowId: !!knockWorkflowId
      });
      throw new Error('Missing Knock configuration. Please ensure all required environment variables are set.')
    }

    // Format the recipient's phone number
    const formattedRecipientNumber = formatPhoneNumber(phoneNumber);
    console.log(`[${requestId}] Formatted recipient number:`, formattedRecipientNumber);

    // Initialize Knock client
    const knock = new Knock(knockApiKey);
    
    // Verify Knock configuration
    const isConfigValid = await verifyKnockConfiguration(knock, knockWorkflowId);
    if (!isConfigValid) {
      throw new Error('Knock configuration verification failed');
    }
    
    // Prepare recipient data
    const recipientId = `phone:${formattedRecipientNumber}`; // Use phone number as recipient ID
    
    // Prepare workflow data based on notification type
    let workflowData: Record<string, any>;
    
    if (type === 'bid_request') {
      const { bidRequestUrl, vehicleDetails } = requestData as BidRequestSMS;
      workflowData = {
        vehicle: vehicleDetails,
        bid_request_url: bidRequestUrl,
        recipient_phone: formattedRecipientNumber
      };
    } else if (type === 'bid_response') {
      const { offerAmount, buyerName, vehicleDetails } = requestData as BidResponseSMS;
      workflowData = {
        vehicle: vehicleDetails,
        offer_amount: offerAmount,
        buyer_name: buyerName,
        recipient_phone: formattedRecipientNumber
      };
    } else {
      // Test SMS
      workflowData = {
        message: (requestData as TestSMS).message || 'Test message from BuyBidHQ',
        recipient_phone: formattedRecipientNumber
      };
    }

    console.log(`[${requestId}] Triggering Knock workflow:`, {
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

    const endTime = performance.now();
    console.log(`[${requestId}] Knock workflow triggered successfully:`, {
      result,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        requestId,
        messageId: result.workflow_runs[0].id,
        duration: `${(endTime - startTime).toFixed(2)}ms`,
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
    console.error(`[${requestId}] Error in send-knock-sms function:`, error);
    
    // Enhanced error handling
    const errorMessage = error.message.includes('Invalid phone number') 
      ? error.message 
      : error.message || 'Failed to send SMS. Please try again.';

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        requestId,
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
