
import { Knock } from "npm:@knocklabs/node@0.4.1"
import { SMSRequest, BidRequestSMS, BidResponseSMS, TestSMS } from "./types.ts"

export async function verifyKnockConfiguration(knockApiKey: string, workflowId: string) {
  try {
    console.log('Verifying Knock configuration for workflow:', workflowId);
    
    const knock = new Knock(knockApiKey);
    if (!knock) {
      throw new Error('Failed to initialize Knock client');
    }
    
    console.log('Successfully verified Knock configuration');
    return knock;
  } catch (error) {
    console.error('Knock configuration verification failed:', {
      message: error.message,
      workflowId
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
