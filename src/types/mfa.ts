
export interface MFAFormData {
  verifyCode: string;
}

export interface MFAState {
  isMFAEnabled: boolean;
  isEnrollingMFA: boolean;
  showMFADialog: boolean;
}

export interface MFAVerificationResult {
  success: boolean;
  error?: string;
}
