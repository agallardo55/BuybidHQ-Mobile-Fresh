
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Knock } from "npm:@knocklabs/node@0.4.1"
import { SMSRequest, BidRequestSMS, BidResponseSMS, TestSMS } from "./types.ts"
import { corsHeaders, formatPhoneNumber } from "./utils.ts"
import { verifyKnockConfiguration, prepareWorkflowData } from "./knockService.ts"

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
    const workflowData = prepareWorkflowData(requestData, formattedRecipientNumber);

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
