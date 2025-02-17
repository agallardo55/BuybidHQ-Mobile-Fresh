
import { PasswordValidationResult } from "@/types/password";

export const validatePassword = (password: string): PasswordValidationResult => {
  if (password.length < 6) {
    return {
      isValid: false,
      error: "Password must be at least 6 characters long",
    };
  }
  return {
    isValid: true,
    error: null,
  };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): PasswordValidationResult => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: "New passwords do not match.",
    };
  }
  return {
    isValid: true,
    error: null,
  };
};
