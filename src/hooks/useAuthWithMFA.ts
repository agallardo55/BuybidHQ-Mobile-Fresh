import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuthWithMFA = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithMFA = async (email: string, password: string, redirectTo?: string) => {
    console.log('useAuthWithMFA: Starting sign in process for:', email);
    try {
      setIsLoading(true);

      // Step 1: Password authentication (creates AAL1 session)
      console.log('useAuthWithMFA: Attempting sign in...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('useAuthWithMFA: Auth result:', { authData, authError });
      
      if (authError) {
        console.log('useAuthWithMFA: Auth failed:', authError.message);
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive",
        });
        return false;
      }

      if (!authData.user) {
        console.log('useAuthWithMFA: No user in auth response');
        toast({
          title: "Error", 
          description: "Sign in failed",
          variant: "destructive",
        });
        return false;
      }

      // Step 2: Check if MFA required using mfa_settings table
      console.log('useAuthWithMFA: Checking MFA settings...');
      const { data: mfaSettings, error: mfaError } = await supabase
        .from('mfa_settings')
        .select('status, method')
        .eq('user_id', authData.user.id)
        .eq('status', 'enabled')
        .eq('method', 'sms');

      console.log('useAuthWithMFA: MFA settings result:', { mfaSettings, mfaError });

      if (mfaError) {
        console.error('Error checking MFA settings:', mfaError);
      }

      const hasMFA = mfaSettings && mfaSettings.length > 0;
      
      if (hasMFA) {
        // MFA required - session is AAL1 at this point
        console.log('useAuthWithMFA: MFA required, redirecting to challenge');
        
        // Build URL params
        const params = new URLSearchParams();
        params.set('email', email);
        if (redirectTo) {
          params.set('redirect', redirectTo);
        }

        navigate(`/auth/mfa-challenge?${params.toString()}`);
        return true;
      }

      // No MFA enabled - full session granted (AAL2)
      console.log('useAuthWithMFA: No MFA enabled, navigating to:', redirectTo || '/dashboard');
      navigate(redirectTo || '/dashboard');
      return true;

    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const completeMFALogin = async (email: string, redirectTo?: string) => {
    try {
      setIsLoading(true);

      // With native Supabase OTP, the user is already authenticated after verifyOtp
      // We just need to navigate to the intended destination

      navigate(redirectTo || '/dashboard');
      return true;

    } catch (error: any) {
      console.error('Error completing MFA login:', error);
      toast({
        title: "Error",
        description: "Failed to complete login",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithMFA,
    completeMFALogin,
    isLoading,
  };
};