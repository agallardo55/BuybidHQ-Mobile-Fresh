
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  checkEmailMFAStatus,
  checkSMSMFAStatus,
  sendMFAEnrollmentEmail,
  sendMFAEnrollmentSMS,
  verifyMFACode,
  disableMFA 
} from "@/utils/mfaUtils";
import { MFAState, MFAMethod } from "@/types/mfa";

export const useMFAManagement = () => {
  const { toast } = useToast();
  const [state, setState] = useState<MFAState>({
    emailMFA: {
      enabled: false,
      enrolling: false,
      showDialog: false,
    },
    smsMFA: {
      enabled: false,
      enrolling: false,
      showDialog: false,
    },
  });
  const [verifyCode, setVerifyCode] = useState("");
  const [currentMethod, setCurrentMethod] = useState<MFAMethod | null>(null);

  const checkMFAStatus = async () => {
    try {
      const [emailEnabled, smsEnabled] = await Promise.all([
        checkEmailMFAStatus(),
        checkSMSMFAStatus()
      ]);
      
      setState(prev => ({
        ...prev,
        emailMFA: { ...prev.emailMFA, enabled: emailEnabled },
        smsMFA: { ...prev.smsMFA, enabled: smsEnabled }
      }));
    } catch (error: any) {
      console.error('Error checking MFA status:', error);
      toast({
        title: "Error",
        description: "Failed to check MFA status",
        variant: "destructive",
      });
    }
  };

  const handleEnrollEmailMFA = async () => {
    try {
      setState(prev => ({
        ...prev,
        emailMFA: { ...prev.emailMFA, enrolling: true }
      }));
      
      await sendMFAEnrollmentEmail();
      setCurrentMethod('email');

      setState(prev => ({
        ...prev,
        emailMFA: { ...prev.emailMFA, showDialog: true }
      }));
      
      toast({
        title: "Code Sent",
        description: "Please check your email for the verification code.",
      });
    } catch (error: any) {
      console.error('Error enrolling email MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enroll email MFA",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({
        ...prev,
        emailMFA: { ...prev.emailMFA, enrolling: false }
      }));
    }
  };

  const handleEnrollSMSMFA = async () => {
    // Get user's mobile number from their profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      return;
    }

    // Get user's mobile number from buybidhq_users table
    const { data: userData, error: userError } = await supabase
      .from('buybidhq_users')
      .select('mobile_number')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.mobile_number) {
      toast({
        title: "Error",
        description: "Please add a mobile number in your Personal Info tab first",
        variant: "destructive",
      });
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        smsMFA: { ...prev.smsMFA, enrolling: true }
      }));
      
      await sendMFAEnrollmentSMS(userData.mobile_number);
      setCurrentMethod('sms');

      setState(prev => ({
        ...prev,
        smsMFA: { ...prev.smsMFA, showDialog: true }
      }));
      
      toast({
        title: "Code Sent",
        description: "Please check your phone for the verification code.",
      });
    } catch (error: any) {
      console.error('Error enrolling SMS MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enroll SMS MFA",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({
        ...prev,
        smsMFA: { ...prev.smsMFA, enrolling: false }
      }));
    }
  };

  const handleVerifyMFA = async () => {
    if (!verifyCode || !currentMethod) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get user's mobile number for SMS verification
      let userMobileNumber;
      if (currentMethod === 'sms') {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: userData } = await supabase
          .from('buybidhq_users')
          .select('mobile_number')
          .eq('id', user!.id)
          .single();
        userMobileNumber = userData?.mobile_number;
      }

      const result = await verifyMFACode(
        currentMethod, 
        verifyCode, 
        userMobileNumber
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: `${currentMethod === 'email' ? 'Email' : 'SMS'} MFA has been enabled successfully`,
      });
      
      setState(prev => ({
        ...prev,
        [currentMethod + 'MFA']: { 
          ...prev[currentMethod + 'MFA' as keyof MFAState] as any, 
          showDialog: false 
        }
      }));
      
      setVerifyCode("");
      setCurrentMethod(null);
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

  const handleDisableEmailMFA = async () => {
    try {
      await disableMFA('email');
      toast({
        title: "Success",
        description: "Email MFA has been disabled successfully",
      });
      checkMFAStatus();
    } catch (error: any) {
      console.error('Error disabling email MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to disable email MFA",
        variant: "destructive",
      });
    }
  };

  const handleDisableSMSMFA = async () => {
    try {
      await disableMFA('sms');
      toast({
        title: "Success",
        description: "SMS MFA has been disabled successfully",
      });
      checkMFAStatus();
    } catch (error: any) {
      console.error('Error disabling SMS MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to disable SMS MFA",
        variant: "destructive",
      });
    }
  };

  const setEmailMFADialog = (show: boolean) => {
    setState(prev => ({
      ...prev,
      emailMFA: { ...prev.emailMFA, showDialog: show }
    }));
    if (!show) {
      setVerifyCode("");
      setCurrentMethod(null);
    }
  };

  const setSMSMFADialog = (show: boolean) => {
    setState(prev => ({
      ...prev,
      smsMFA: { ...prev.smsMFA, showDialog: show }
    }));
    if (!show) {
      setVerifyCode("");
      setCurrentMethod(null);
    }
  };

  useEffect(() => {
    checkMFAStatus();
  }, []);

  return {
    ...state,
    verifyCode,
    setVerifyCode,
    currentMethod,
    setEmailMFADialog,
    setSMSMFADialog,
    handleEnrollEmailMFA,
    handleEnrollSMSMFA,
    handleVerifyMFA,
    handleDisableEmailMFA,
    handleDisableSMSMFA,
  };
};
