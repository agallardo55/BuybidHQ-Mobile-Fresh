
export type SignUpStep = 'plan' | 'personal' | 'dealership';
export type PlanType = 'beta-access' | 'individual' | 'pay-per-bid' | 'annual';

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
  planType?: PlanType;
  smsConsent: boolean;
}

export interface SignUpState {
  formData: SignUpFormData;
  currentStep: SignUpStep;
  isSubmitting: boolean;
}
