
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useMFAManagement = () => {
  const { toast } = useToast();
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [isEnrollingMFA, setIsEnrollingMFA] = useState(false);
  const [showMFADialog, setShowMFADialog] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");

  const checkMFAStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: factors, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      const hasEmailFactor = factors.all.some(factor => factor.factor_type === 'email');
      setIsMFAEnabled(hasEmailFactor);
    } catch (error: any) {
      console.error('Error checking MFA status:', error);
      toast({
        title: "Error",
        description: "Failed to check MFA status",
        variant: "destructive",
      });
    }
  };

  const handleEnrollMFA = async () => {
    try {
      setIsEnrollingMFA(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("No user email found");
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (error) throw error;

      setShowMFADialog(true);
      toast({
        title: "Code Sent",
        description: "Please check your email for the verification code.",
      });
    } catch (error: any) {
      console.error('Error enrolling MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enroll MFA",
        variant: "destructive",
      });
    } finally {
      setIsEnrollingMFA(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!verifyCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("No user email found");
      }

      const { error } = await supabase.auth.verifyOtp({
        email: user.email,
        token: verifyCode,
        type: 'email'
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email-based MFA has been enabled successfully",
      });
      
      setShowMFADialog(false);
      setVerifyCode("");
      checkMFAStatus();
    } catch (error: any) {
      console.error('Error verifying MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      });
    }
  };

  const handleDisableMFA = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("No user email found");
      }

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: 'email'
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "MFA has been disabled successfully",
      });
      
      checkMFAStatus();
    } catch (error: any) {
      console.error('Error disabling MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to disable MFA",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkMFAStatus();
  }, []);

  return {
    isMFAEnabled,
    isEnrollingMFA,
    showMFADialog,
    verifyCode,
    setVerifyCode,
    setShowMFADialog,
    handleEnrollMFA,
    handleVerifyMFA,
    handleDisableMFA,
  };
};
