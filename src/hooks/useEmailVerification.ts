import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./useCurrentUser";
import { toast } from "@/utils/notificationToast";

export const useEmailVerification = () => {
  const { currentUser } = useCurrentUser();
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check if user's email is verified using Supabase auth user
  const [authUser, setAuthUser] = useState<any>(null);
  
  useEffect(() => {
    const getAuthUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);
    };
    
    getAuthUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const isEmailVerified = authUser?.email_confirmed_at !== null && authUser?.email_confirmed_at !== undefined;

  // Cooldown timer for resend verification
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  const resendVerificationEmail = async () => {
    if (!authUser?.email || !canResend) return false;

    setIsResendingVerification(true);
    setCanResend(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: authUser.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      toast.success("Verification email sent! Please check your inbox.");
      setResendCooldown(60); // 60 second cooldown
      return true;
    } catch (error: any) {
      console.error("Failed to resend verification email:", error);
      toast.error(error.message || "Failed to send verification email");
      setCanResend(true);
      return false;
    } finally {
      setIsResendingVerification(false);
    }
  };

  return {
    isEmailVerified,
    isResendingVerification,
    canResend,
    resendCooldown,
    resendVerificationEmail,
  };
};