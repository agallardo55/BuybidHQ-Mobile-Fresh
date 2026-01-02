
import { PasswordValidationResult } from "@/types/password";

export const validatePassword = (password: string): PasswordValidationResult => {
  // Enforce minimum password length
  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long",
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
