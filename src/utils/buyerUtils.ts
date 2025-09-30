
import { Buyer } from "@/types/buyers";

type SortConfig = {
  field: keyof Buyer | null;
  direction: 'asc' | 'desc' | null;
};

export const sortBuyers = (buyers: Buyer[], sortConfig: SortConfig) => {
  if (!sortConfig.field || !sortConfig.direction) {
    return buyers;
  }

  return [...buyers].sort((a, b) => {
    const aValue = a[sortConfig.field!];
    const bValue = b[sortConfig.field!];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const stringA = String(aValue).toLowerCase();
    const stringB = String(bValue).toLowerCase();
    
    return sortConfig.direction === 'asc'
      ? stringA.localeCompare(stringB)
      : stringB.localeCompare(stringA);
  });
};

export const filterBuyers = (buyers: Buyer[], searchTerm: string) => {
  const searchString = searchTerm.toLowerCase();
  return buyers.filter((buyer) => (
    buyer.name.toLowerCase().includes(searchString) ||
    buyer.email.toLowerCase().includes(searchString)
  ));
};

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

export const handleSort = (
  field: keyof Buyer,
  currentConfig: SortConfig,
  setSortConfig: (config: SortConfig) => void
) => {
  if (currentConfig.field === field) {
    if (currentConfig.direction === 'asc') {
      setSortConfig({ field, direction: 'desc' });
    } else if (currentConfig.direction === 'desc') {
      setSortConfig({ field: null, direction: null });
    }
  } else {
    setSortConfig({ field, direction: 'asc' });
  }
};
