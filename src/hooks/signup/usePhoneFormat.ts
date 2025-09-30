
export const usePhoneFormat = () => {
  const formatPhoneNumber = (value: string) => {
    if (value === undefined || value === null) return '';
    
    // Strip all non-digit characters from the input
    const digitsOnly = value.replace(/\D/g, '');
    
    // Handle 11-digit numbers with leading 1 (strip the country code)
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

  return { formatPhoneNumber };
};
