
export interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  carrier?: string;
  businessNumber: string;
  dealershipName: string;
  licenseNumber: string;
  dealershipAddress: string;
  city: string;
  state: string;
  zipCode: string;
  planType: 'beta-access' | 'individual' | undefined;
  smsConsent: boolean;
}

export type SignUpStep = 'plan' | 'personal' | 'dealership';
