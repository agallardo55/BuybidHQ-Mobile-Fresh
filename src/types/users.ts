
export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: "admin" | "dealer" | "basic" | "individual";
  status: string;
  mobileNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  dealershipId: string | null;
  dealershipName?: string | null;
  isActive: boolean;
}

export interface UserFormData {
  fullName: string;
  email: string;
  role: "admin" | "dealer" | "basic" | "individual";
  mobileNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dealershipId: string;
  isActive: boolean;
}
