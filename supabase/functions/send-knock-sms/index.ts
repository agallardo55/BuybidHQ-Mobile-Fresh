
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Knock } from "npm:@knocklabs/node@0.4.1"
import { SMSRequest } from "./types.ts"
import { corsHeaders, formatPhoneNumber } from "./utils.ts"
import { verifyKnockConfiguration, prepareWorkflowData } from "./knockService.ts"

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Starting request processing`);

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

    // Define workflow IDs directly
    const knockWorkflowId = type === 'bid_request' 
      ? 'bid-request-sms'
      : type === 'bid_response'
      ? 'bid-response-sms'
      : 'test-sms';

    // Format phone number
    console.log(`[${requestId}] Formatting phone number:`, phoneNumber);
    const formattedRecipientNumber = formatPhoneNumber(phoneNumber);

    // Initialize and verify Knock configuration
    console.log(`[${requestId}] Initializing Knock client`);
    const knock = await verifyKnockConfiguration(knockApiKey, knockWorkflowId);
    
    // Prepare workflow data
    const recipientId = `phone:${formattedRecipientNumber}`;
    const workflowData = prepareWorkflowData(requestData, formattedRecipientNumber);
    
    console.log(`[${requestId}] Triggering notification with data:`, {
      workflowId: knockWorkflowId,
      recipientId,
      ...workflowData
    });

    // Trigger notification
    const result = await knock.notify(knockWorkflowId, {
      actor: "system",
      recipients: [recipientId],
      data: workflowData
    });

    console.log(`[${requestId}] Notification triggered successfully:`, {
      runId: result.id
    });

    return new Response(
      JSON.stringify({
        success: true,
        requestId,
        messageId: result.id
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
    console.error(`[${requestId}] Error:`, {
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
        status: 200, // Keep 200 to prevent CORS issues
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
