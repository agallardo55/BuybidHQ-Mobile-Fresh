
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  checkEmailMFAStatus, 
  sendMFAEnrollmentEmail, 
  verifyMFACode,
  disableMFA 
} from "@/utils/mfaUtils";
import { MFAState } from "@/types/mfa";

export const useMFAManagement = () => {
  const { toast } = useToast();
  const [state, setState] = useState<MFAState>({
    isMFAEnabled: false,
    isEnrollingMFA: false,
    showMFADialog: false,
  });
  const [verifyCode, setVerifyCode] = useState("");

  const checkMFAStatus = async () => {
    try {
      const isEnabled = await checkEmailMFAStatus();
      setState(prev => ({ ...prev, isMFAEnabled: isEnabled }));
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
      setState(prev => ({ ...prev, isEnrollingMFA: true }));
      
      await sendMFAEnrollmentEmail();

      setState(prev => ({ ...prev, showMFADialog: true }));
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
      setState(prev => ({ ...prev, isEnrollingMFA: false }));
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

      const result = await verifyMFACode(user.email, verifyCode);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Email-based MFA has been enabled successfully",
      });
      
      setState(prev => ({ ...prev, showMFADialog: false }));
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
      await disableMFA();

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
    ...state,
    verifyCode,
    setVerifyCode,
    setShowMFADialog: (show: boolean) => setState(prev => ({ ...prev, showMFADialog: show })),
    handleEnrollMFA,
    handleVerifyMFA,
    handleDisableMFA,
  };
};
