
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if number is valid (10 digits for US numbers)
  if (cleaned.length !== 10) {
    throw new Error(`Invalid phone number length: ${cleaned.length} digits. Expected 10 digits.`);
  }
  
  // Add +1 for US numbers
  return `+1${cleaned}`;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
