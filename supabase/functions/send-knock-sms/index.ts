
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Content-Type': 'application/json',
      },
      status: 200
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

    // Format phone number with country code if not present
    console.log(`[${requestId}] Formatting phone number:`, phoneNumber);
    let formattedRecipientNumber = formatPhoneNumber(phoneNumber);
    if (!formattedRecipientNumber.startsWith('+')) {
      formattedRecipientNumber = '+1' + formattedRecipientNumber;
    }

    // Initialize Knock client
    const knock = new Knock(knockApiKey);
    
    // Prepare workflow data
    const recipientId = formattedRecipientNumber;
    const workflowData = prepareWorkflowData(requestData, formattedRecipientNumber);

    // Generate a unique actor ID for the system
    const actorId = `system-${requestId}`;

    // Determine which workflow to use based on the request type
    let workflowKey;
    switch (type) {
      case 'bid_request':
        workflowKey = 'bid-request-notification';
        break;
      case 'bid_response':
        workflowKey = 'bid-response-notification';
        break;
      default:
        workflowKey = 'sms-test';
    }

    // Log full configuration before making the request
    console.log(`[${requestId}] Knock configuration:`, {
      workflow: workflowKey,
      recipientId,
      actorId,
      data: workflowData
    });
    
    try {
      // Create the actor first
      await knock.users.identify(actorId, {
        name: "BuyBidHQ System",
        email: "system@buybidhq.com"
      });

      // Identify the recipient
      await knock.users.identify(recipientId, {
        name: "SMS Recipient",
        phone_number: formattedRecipientNumber,
      });

      // Then trigger the workflow with the actor
      const result = await knock.workflows.trigger(workflowKey, {
        recipients: [recipientId],
        actor: actorId,
        data: workflowData
      });

      console.log(`[${requestId}] Notification triggered successfully:`, {
        runId: result.id,
        recipientNumber: formattedRecipientNumber
      });

      return new Response(
        JSON.stringify({
          success: true,
          requestId,
          messageId: result.id,
          recipientNumber: formattedRecipientNumber
        }),
        {
          headers: {
            ...corsHeaders,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Content-Type': 'application/json'
          },
          status: 200
        }
      );
    } catch (knockError) {
      console.error(`[${requestId}] Knock API Error:`, {
        message: knockError.message,
        status: knockError.status,
        details: knockError.details
      });
      throw new Error(`Knock API Error: ${knockError.message}`);
    }
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
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json'
        },
        status: 200 // Keep 200 to prevent CORS issues
      }
    );
  }
});
