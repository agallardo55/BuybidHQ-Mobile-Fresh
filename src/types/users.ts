
export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  status: string;
  mobileNumber: string | null;
}

export interface UserFormData {
  fullName: string;
  email: string;
  role: string;
  mobileNumber: string;
}
