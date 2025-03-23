
export const usePhoneFormat = () => {
  const formatPhoneNumber = (value: string) => {
    if (value === undefined || value === null) return '';
    
    // Strip all non-digit characters from the input
    const digitsOnly = value.replace(/\D/g, '');
    
    // Format based on the length of the phone number
    if (digitsOnly.length >= 10) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
    }
    if (digitsOnly.length > 6) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    }
    if (digitsOnly.length > 3) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    }
    if (digitsOnly.length > 0) {
      return `(${digitsOnly}`;
    }
    return '';
  };

  return { formatPhoneNumber };
};
