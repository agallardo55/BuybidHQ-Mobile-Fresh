
export interface MFAMethodState {
  enabled: boolean;
  enrolling: boolean;
  showDialog: boolean;
}

export interface SMSMFAState {
  enabled: boolean;
  enrolling: boolean;
  showDialog: boolean;
}

export interface MFAVerificationResult {
  success: boolean;
  error?: string;
}

export type MFAMethod = 'sms';
