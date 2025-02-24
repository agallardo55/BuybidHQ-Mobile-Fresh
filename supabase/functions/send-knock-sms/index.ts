
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Knock } from "npm:@knocklabs/node@0.8.0"

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
    console.log('Attempting to verify Knock workflow:', workflowId);
    
    // First try to list workflows to check API connectivity
    const workflows = await knock.workflows.list();
    console.log('Successfully connected to Knock API, found workflows:', workflows.length);
    
    // Then try to get the specific workflow
    const workflow = await knock.workflows.get(workflowId);
    console.log('Successfully found workflow:', {
      id: workflow.id,
      name: workflow.name,
      active: workflow.active
    });
    
    return true;
  } catch (error) {
    console.error('Knock configuration verification failed:', {
      error,
      workflowId,
      errorMessage: error.message,
      errorName: error.name,
      stack: error.stack
    });
    throw new Error(`Knock API Error: ${error.message}`);
  }
}

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Beginning request processing`);

  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Parse and validate request data
    let requestData: SMSRequest;
    try {
      requestData = await req.json();
      console.log(`[${requestId}] Received request:`, {
        type: requestData.type,
        phoneNumber: requestData.phoneNumber.slice(-4).padStart(requestData.phoneNumber.length, '*')
      });
    } catch (error) {
      console.error(`[${requestId}] Request parsing failed:`, error);
      throw new Error('Invalid request format');
    }

    const { type, phoneNumber } = requestData;

    // Validate environment variables
    const knockApiKey = Deno.env.get('KNOCK_API_KEY');
    const knockWorkflowId = type === 'bid_request' 
      ? Deno.env.get('KNOCK_BID_REQUEST_WORKFLOW')
      : type === 'bid_response'
      ? Deno.env.get('KNOCK_BID_RESPONSE_WORKFLOW')
      : Deno.env.get('KNOCK_TEST_WORKFLOW');

    if (!knockApiKey) {
      throw new Error('KNOCK_API_KEY is not set');
    }

    if (!knockWorkflowId) {
      throw new Error(`Missing workflow ID for type: ${type}`);
    }

    console.log(`[${requestId}] Using workflow:`, knockWorkflowId);

    // Format phone number
    let formattedRecipientNumber: string;
    try {
      formattedRecipientNumber = formatPhoneNumber(phoneNumber);
      console.log(`[${requestId}] Formatted phone:`, formattedRecipientNumber.slice(-4).padStart(formattedRecipientNumber.length, '*'));
    } catch (error) {
      throw new Error(`Phone number validation failed: ${error.message}`);
    }

    // Initialize Knock
    console.log(`[${requestId}] Initializing Knock client`);
    const knock = new Knock(knockApiKey);

    // Verify Knock configuration
    await verifyKnockConfiguration(knock, knockWorkflowId);
    
    // Prepare workflow data
    const recipientId = `phone:${formattedRecipientNumber}`;
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
      workflowData = {
        message: (requestData as TestSMS).message || 'Test message from BuyBidHQ',
        recipient_phone: formattedRecipientNumber
      };
    }

    console.log(`[${requestId}] Triggering workflow with data:`, workflowData);

    // Trigger workflow
    const result = await knock.workflows.trigger(knockWorkflowId, {
      recipients: [recipientId],
      data: workflowData,
      actor: "system"
    });

    console.log(`[${requestId}] Workflow triggered successfully:`, {
      runId: result.workflow_runs[0].id,
      status: result.workflow_runs[0].status
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        requestId,
        messageId: result.workflow_runs[0].id
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error(`[${requestId}] Function error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return new Response(
      JSON.stringify({
        error: error.message,
        requestId,
        timestamp: new Date().toISOString()
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
