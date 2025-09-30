/**
 * Phone number utility functions for normalization and formatting
 */

/**
 * Normalizes a phone number to 10 digits only (no formatting, no country code)
 * @param phone - Phone number in any format
 * @returns 10-digit phone number string, or empty string if invalid
 */
export const normalizePhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Handle 11-digit numbers with leading 1 (US country code)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return digitsOnly.substring(1);
  }
  
  // Return 10-digit numbers as-is
  if (digitsOnly.length === 10) {
    return digitsOnly;
  }
  
  // Invalid format, return empty string
  return '';
};

/**
 * Formats a phone number for display (strips country code if present, then formats)
 * @param phone - Phone number in any format
 * @returns Formatted phone number as (XXX) XXX-XXXX or '-' if invalid
 */
export const formatPhoneForDisplay = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Handle 11-digit numbers with leading 1 (strip the country code)
  let phoneNumber = digitsOnly;
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    phoneNumber = digitsOnly.substring(1);
  }
  
  // Format 10-digit numbers
  if (phoneNumber.length === 10) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }
  
  // Return original if not a standard format
  return phone;
};

/**
 * Formats a phone number for input as user types (real-time formatting)
 * @param value - Current input value
 * @returns Formatted phone number as (XXX) XXX-XXXX
 */
export const formatPhoneForInput = (value: string): string => {
  if (value === undefined || value === null) return '';
  
  // Strip all non-digit characters from the input
  const digitsOnly = value.replace(/\D/g, '');
  
  // Strip leading 1 if present (US country code)
  let cleanDigits = digitsOnly;
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    cleanDigits = digitsOnly.substring(1);
  }
  
  // Format based on the length of the phone number
  if (cleanDigits.length >= 10) {
    return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6, 10)}`;
  }
  if (cleanDigits.length > 6) {
    return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6)}`;
  }
  if (cleanDigits.length > 3) {
    return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3)}`;
  }
  if (cleanDigits.length > 0) {
    return `(${cleanDigits}`;
  }
  return '';
};
