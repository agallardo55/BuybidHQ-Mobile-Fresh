
export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: "admin" | "dealer" | "associate";
  status: string;
  mobileNumber: string | null;
  businessNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  dealershipId: string | null;
  dealershipName?: string | null;
  dealershipInfo?: DealershipFormData;
  dealerId?: string | null;
  isActive: boolean;
}

export interface UserFormData {
  fullName: string;
  email: string;
  role: "admin" | "dealer" | "associate";
  mobileNumber: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dealershipId?: string;
  isActive: boolean;
}

export interface DealershipFormData {
  dealerName: string;
  dealerId: string;
  businessPhone: string;
  businessEmail: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}
