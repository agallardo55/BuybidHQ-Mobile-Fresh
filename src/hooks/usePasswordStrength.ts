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
    let strength: PasswordValidation["strength"];

    // Length check - only requirement
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
      strength = "very_weak";
      score = 0;
    } else if (password.length < 10) {
      strength = "fair";
      score = 60;
    } else if (password.length < 12) {
      strength = "good";
      score = 80;
    } else {
      strength = "strong";
      score = 100;
    }

    // Bonus points for complexity (optional, doesn't affect validity)
    if (password.length >= 8) {
      if (/[A-Z]/.test(password)) score = Math.min(score + 5, 100);
      if (/[a-z]/.test(password)) score = Math.min(score + 5, 100);
      if (/\d/.test(password)) score = Math.min(score + 5, 100);
      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score = Math.min(score + 5, 100);
    }

    return {
      isValid: errors.length === 0,
      score,
      errors,
      strength,
    };
  }, [password]);
};