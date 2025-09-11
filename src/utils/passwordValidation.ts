
import { PasswordValidationResult } from "@/types/password";

export const validatePassword = (password: string): PasswordValidationResult => {
  // Enforce strong password requirements (minimum 12 characters, complexity)
  if (password.length < 12) {
    return {
      isValid: false,
      error: "Password must be at least 12 characters long",
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number",
    };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)",
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
