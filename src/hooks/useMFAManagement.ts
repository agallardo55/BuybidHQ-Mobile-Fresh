
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  checkEmailMFAStatus,
  checkSMSMFAStatus,
  enableMFA,
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

  const handleEnableEmailMFA = async () => {
    try {
      setState(prev => ({
        ...prev,
        emailMFA: { ...prev.emailMFA, enrolling: true }
      }));
      
      await enableMFA('email');
      
      toast({
        title: "Success",
        description: "Email MFA has been enabled successfully",
      });
      
      checkMFAStatus();
    } catch (error: any) {
      console.error('Error enabling email MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enable email MFA",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({
        ...prev,
        emailMFA: { ...prev.emailMFA, enrolling: false }
      }));
    }
  };

  const handleEnableSMSMFA = async () => {
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
      
      await enableMFA('sms');
      
      toast({
        title: "Success",
        description: "SMS MFA has been enabled successfully",
      });
      
      checkMFAStatus();
    } catch (error: any) {
      console.error('Error enabling SMS MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enable SMS MFA",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({
        ...prev,
        smsMFA: { ...prev.smsMFA, enrolling: false }
      }));
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

  useEffect(() => {
    checkMFAStatus();
  }, []);

  return {
    ...state,
    handleEnableEmailMFA,
    handleEnableSMSMFA,
    handleDisableEmailMFA,
    handleDisableSMSMFA,
  };
};
