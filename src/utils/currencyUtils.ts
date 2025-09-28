/**
 * Utility functions for handling currency values
 */

/**
 * Extracts numeric value from a currency string
 * Handles formatted strings like "$1,234", "1234", "$0", etc.
 * Returns numeric string or "0" as fallback
 */
export const extractNumericValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  
  // Convert to string and extract only digits
  const numericValue = String(value).replace(/[^0-9]/g, '');
  
  // Return "0" if no digits found or empty
  return numericValue || '0';
};

/**
 * Safely parses a currency value to a number
 * Handles formatted strings like "$1,234", "1234", "$0", etc.
 * Returns 0 as fallback for invalid values
 */
export const parseCurrencyValue = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const numericValue = extractNumericValue(value);
  const parsed = parseFloat(numericValue);
  
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formats a number as currency display
 * Returns formatted string like "$1,234" or "$0"
 */
export const formatCurrencyDisplay = (value: string | number | null | undefined): string => {
  const numericValue = parseCurrencyValue(value);
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericValue);
};