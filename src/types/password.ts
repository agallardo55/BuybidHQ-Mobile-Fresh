
export interface PasswordData {
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  error: string | null;
}
