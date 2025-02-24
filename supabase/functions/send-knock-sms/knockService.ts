
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
    const { bidRequestUrl, senderName } = requestData as BidRequestSMS;
    
    // Ensure the token parameter is properly encoded in the URL
    const url = new URL(bidRequestUrl);
    const token = url.searchParams.get('token');
    if (token) {
      // Reconstruct URL with properly encoded token
      url.searchParams.set('token', encodeURIComponent(token));
    }

    return {
      sender_name: senderName,
      bid_request_url: url.toString(),
      recipient_phone: formattedRecipientNumber
    };
  } else if (requestData.type === 'bid_response') {
    const { offerAmount, buyerName, vehicleDetails } = requestData as BidResponseSMS;
    return {
      offer_amount: offerAmount,
      buyer_name: buyerName,
      vehicle_details: vehicleDetails,
      recipient_phone: formattedRecipientNumber
    };
  } else {
    return {
      message: (requestData as TestSMS).message || 'Test message from BuyBidHQ',
      recipient_phone: formattedRecipientNumber
    };
  }
}

