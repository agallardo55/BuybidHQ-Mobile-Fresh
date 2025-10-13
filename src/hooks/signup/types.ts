
export type SignUpStep = 'plan' | 'personal';
export type PlanType = 'beta-access' | 'connect' | 'annual';

export interface SignUpFormData {
  dealershipName: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  planType?: PlanType;
  smsConsent: boolean;
}

export interface SignUpState {
  formData: SignUpFormData;
  currentStep: SignUpStep;
  isSubmitting: boolean;
}
