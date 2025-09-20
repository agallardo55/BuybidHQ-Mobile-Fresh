
export interface MFAFormData {
  verifyCode: string;
}

export interface MFAMethodState {
  enabled: boolean;
  enrolling: boolean;
  showDialog: boolean;
}

export interface MFAState {
  emailMFA: MFAMethodState;
  smsMFA: MFAMethodState;
}

export interface MFAVerificationResult {
  success: boolean;
  error?: string;
}

export type MFAMethod = 'email' | 'sms';
