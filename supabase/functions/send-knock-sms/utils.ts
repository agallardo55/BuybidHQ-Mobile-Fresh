
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // If the number starts with +1, remove it
  const withoutCountryCode = cleaned.startsWith('1') ? cleaned.slice(1) : cleaned;
  
  // Return the last 10 digits if more are provided
  const last10 = withoutCountryCode.slice(-10);
  
  if (last10.length !== 10) {
    throw new Error('Invalid phone number format. Must be 10 digits.');
  }
  
  return last10;
};

