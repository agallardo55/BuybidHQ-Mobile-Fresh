
export const usePhoneFormat = () => {
  const formatPhoneNumber = (value: string) => {
    if (!value) return '';
    
    // Strip all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format based on the length of the phone number
    if (phoneNumber.length >= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
    if (phoneNumber.length > 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    }
    if (phoneNumber.length > 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    if (phoneNumber.length > 0) {
      return `(${phoneNumber}`;
    }
    return '';
  };

  return { formatPhoneNumber };
};
