
import { Knock } from "npm:@knocklabs/node@0.4.1"
import { SMSRequest, BidRequestSMS, BidResponseSMS, TestSMS } from "./types.ts"

export async function verifyKnockConfiguration(knock: Knock, workflowId: string) {
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

export function prepareWorkflowData(requestData: SMSRequest, formattedRecipientNumber: string) {
  if (requestData.type === 'bid_request') {
    const { bidRequestUrl, vehicleDetails } = requestData as BidRequestSMS;
    return {
      vehicle: vehicleDetails,
      bid_request_url: bidRequestUrl,
      recipient_phone: formattedRecipientNumber
    };
  } else if (requestData.type === 'bid_response') {
    const { offerAmount, buyerName, vehicleDetails } = requestData as BidResponseSMS;
    return {
      vehicle: vehicleDetails,
      offer_amount: offerAmount,
      buyer_name: buyerName,
      recipient_phone: formattedRecipientNumber
    };
  } else {
    return {
      message: (requestData as TestSMS).message || 'Test message from BuyBidHQ',
      recipient_phone: formattedRecipientNumber
    };
  }
}
