import { useMemo } from "react";

interface PasswordValidation {
  isValid: boolean;
  score: number;
  errors: string[];
  strength: "very_weak" | "weak" | "fair" | "good" | "strong";
}

export const usePasswordStrength = (password: string): PasswordValidation => {
  return useMemo(() => {
    const errors: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    } else {
      score += 20;
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    } else {
      score += 20;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    } else {
      score += 20;
    }

    // Number check
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    } else {
      score += 20;
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    } else {
      score += 20;
    }

    let strength: PasswordValidation["strength"];
    if (score < 40) strength = "very_weak";
    else if (score < 60) strength = "weak";
    else if (score < 80) strength = "fair";
    else if (score < 100) strength = "good";
    else strength = "strong";

    return {
      isValid: errors.length === 0,
      score,
      errors,
      strength,
    };
  }, [password]);
};