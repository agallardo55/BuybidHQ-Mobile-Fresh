
export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: "admin" | "dealer" | "basic";
  status: string;
  mobileNumber: string | null;
}

export interface UserFormData {
  fullName: string;
  email: string;
  role: "admin" | "dealer" | "basic";
  mobileNumber: string;
}
