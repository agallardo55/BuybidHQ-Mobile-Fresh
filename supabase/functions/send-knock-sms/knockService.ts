import { Knock } from "https://esm.sh/@knocklabs/node@0.4.1"

export function verifyKnockConfiguration(knockApiKey: string, workflowId: string) {
  try {
    console.log('Verifying Knock configuration for workflow:', workflowId);
    
    const knockClient = new Knock(knockApiKey);
    if (!knockClient) {
      throw new Error('Failed to initialize Knock client');
    }
    
    console.log('Successfully verified Knock configuration');
    return knockClient;
  } catch (error) {
    console.error('Knock configuration verification failed:', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error(`Knock API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function sendKnockWorkflow(
  knockClient: any,
  workflowId: string,
  recipientId: string,
  data: any
) {
  try {
    console.log('Sending Knock workflow:', {
      workflowId,
      recipientId,
      dataPreview: JSON.stringify(data, null, 2).substring(0, 200) + '...'
    });

    const result = await knockClient.workflows.trigger(workflowId, {
      recipients: [recipientId],
      data: data
    });

    console.log('Knock workflow triggered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error triggering Knock workflow:', error);
    throw error;
  }
}

export async function verifyKnockRecipient(
  knockClient: any,
  recipientId: string,
  phoneNumber: string
) {
  try {
    console.log('Verifying Knock recipient:', recipientId);

    // Set/update the recipient's phone number
    await knockClient.users.identify(recipientId, {
      phone_number: phoneNumber
    });

    console.log('Knock recipient verified successfully');
    return true;
  } catch (error) {
    console.error('Error verifying Knock recipient:', error);
    throw error;
  }
}

export function prepareWorkflowData(data: any, recipientNumber?: string) {
  // Prepare and format data for Knock workflow
  return {
    ...data,
    recipientNumber: recipientNumber,
    timestamp: new Date().toISOString()
  };
}