
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
    buyer.email.toLowerCase().includes(searchString) ||
    buyer.location.toLowerCase().includes(searchString)
  ));
};

export const formatPhoneForDisplay = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Handle US phone numbers (10 or 11 digits)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    // Remove leading 1 for US numbers
    const phoneNumber = digitsOnly.substring(1);
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  } else if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
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
