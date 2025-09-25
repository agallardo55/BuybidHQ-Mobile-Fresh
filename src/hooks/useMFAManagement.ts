
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  checkSMSMFAStatus,
  enableMFA,
  disableMFA 
} from "@/utils/mfaUtils";
import { SMSMFAState } from "@/types/mfa";

export const useMFAManagement = () => {
  const { toast } = useToast();
  const [smsMFA, setSmsMFA] = useState<SMSMFAState>({
    enabled: false,
    enrolling: false,
    showDialog: false,
  });

  const checkMFAStatus = async () => {
    try {
      const smsEnabled = await checkSMSMFAStatus();
      setSmsMFA(prev => ({ ...prev, enabled: smsEnabled }));
    } catch (error: any) {
      console.error('Error checking MFA status:', error);
      toast({
        title: "Error",
        description: "Failed to check MFA status",
        variant: "destructive",
      });
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
      setSmsMFA(prev => ({ ...prev, enrolling: true }));
      
      await enableMFA();
      
      checkMFAStatus();
    } catch (error: any) {
      console.error('Error enabling SMS MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enable SMS MFA",
        variant: "destructive",
      });
    } finally {
      setSmsMFA(prev => ({ ...prev, enrolling: false }));
    }
  };

  const handleDisableSMSMFA = async () => {
    try {
      await disableMFA();
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
    smsMFA,
    handleEnableSMSMFA,
    handleDisableSMSMFA,
  };
};
