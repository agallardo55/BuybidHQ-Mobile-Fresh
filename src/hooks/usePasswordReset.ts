import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PasswordResetHook {
  sendReset: (email: string) => Promise<void>;
  isLoading: boolean;
}

export const usePasswordReset = (): PasswordResetHook => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendReset = async (email: string) => {
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
      console.error('Error sending password reset:', error);
      throw error;
    }
  };

  return {
    sendReset,
    isLoading
  };
};