import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PasswordResetHook {
  checkMFARequired: (email: string) => Promise<{ hasMFA: boolean; methods?: string[] }>;
  sendMFAChallenge: (email: string, method: 'email' | 'sms') => Promise<void>;
  verifyMFAAndReset: (email: string, code: string) => Promise<boolean>;
  sendStandardReset: (email: string) => Promise<void>;
  isLoading: boolean;
}

export const usePasswordReset = (): PasswordResetHook => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkMFARequired = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-mfa-for-reset', {
        body: { email }
      });

      if (error) throw error;

      return {
        hasMFA: data?.hasMFA || false,
        methods: data?.methods || []
      };
    } catch (error: any) {
      console.error('Error checking MFA requirement:', error);
      throw error;
    }
  };

  const sendMFAChallenge = async (email: string, method: 'email' | 'sms') => {
    try {
      const { error } = await supabase.functions.invoke('send-mfa-reset-challenge', {
        body: { email, method }
      });

      if (error) throw error;

      toast({
        title: "Code Sent",
        description: `Verification code sent via ${method === 'email' ? 'email' : 'SMS'}`,
      });
    } catch (error: any) {
      console.error('Error sending MFA challenge:', error);
      throw error;
    }
  };

  const verifyMFAAndReset = async (email: string, code: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('complete-mfa-password-reset', {
        body: { email, verificationCode: code }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Success",
          description: "MFA verification successful! Check your email for the password reset link.",
        });
        return true;
      } else {
        toast({
          title: "Invalid Code",
          description: data?.error || "The verification code is incorrect or expired",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error verifying MFA code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      });
      return false;
    }
  };

  const sendStandardReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "If an account exists with this email, you will receive password reset instructions.",
      });
    } catch (error: any) {
      console.error('Error sending standard reset:', error);
      throw error;
    }
  };

  return {
    checkMFARequired,
    sendMFAChallenge,
    verifyMFAAndReset,
    sendStandardReset,
    isLoading
  };
};