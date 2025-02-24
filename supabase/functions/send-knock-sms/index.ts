
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Knock } from "npm:@knocklabs/node@0.4.1"
import { SMSRequest } from "./types.ts"
import { corsHeaders, formatPhoneNumber } from "./utils.ts"
import { verifyKnockConfiguration, prepareWorkflowData } from "./knockService.ts"

serve(async (req) => {
  const requestId = crypto.randomUUID();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // Parse and validate request data
    let requestData: SMSRequest;
    try {
      requestData = await req.json();
      console.log(`[${requestId}] Request data:`, JSON.stringify(requestData, null, 2));
    } catch (error) {
      console.error(`[${requestId}] JSON parse error:`, error);
      throw new Error('Invalid request format');
    }

    const { type, phoneNumber } = requestData;
    
    // Validate phone number presence
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    // Validate environment variables
    const knockApiKey = Deno.env.get('KNOCK_API_KEY');
    if (!knockApiKey) {
      throw new Error('KNOCK_API_KEY is not set');
    }

    const knockWorkflowId = type === 'bid_request' 
      ? Deno.env.get('KNOCK_BID_REQUEST_WORKFLOW')
      : type === 'bid_response'
      ? Deno.env.get('KNOCK_BID_RESPONSE_WORKFLOW')
      : Deno.env.get('KNOCK_TEST_WORKFLOW');

    if (!knockWorkflowId) {
      throw new Error(`Missing workflow ID for type: ${type}`);
    }

    // Format phone number
    const formattedRecipientNumber = formatPhoneNumber(phoneNumber);

    // Initialize Knock and verify configuration
    const knock = new Knock(knockApiKey);
    await verifyKnockConfiguration(knock, knockWorkflowId);
    
    // Prepare workflow data
    const recipientId = `phone:${formattedRecipientNumber}`;
    const workflowData = prepareWorkflowData(requestData, formattedRecipientNumber);

    // Trigger workflow
    const result = await knock.workflows.trigger(knockWorkflowId, {
      recipients: [recipientId],
      data: workflowData,
      actor: "system"
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
        },
        status: 200
      }
    );
  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        requestId,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200, // Changed to 200 to prevent CORS issues
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
