import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuthWithMFA = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithMFA = async (email: string, password: string, redirectTo?: string) => {
    try {
      setIsLoading(true);

      // Check MFA settings BEFORE signing in
      const { data: userData, error: userError } = await supabase
        .from('buybidhq_users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        // User not found, proceed with normal sign in to get proper error
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (authError) {
          toast({
            title: "Error",
            description: authError.message,
            variant: "destructive",
          });
        }
        return false;
      }

      // Check if user has MFA enabled
      const { data: mfaSettings, error: mfaError } = await supabase
        .from('mfa_settings')
        .select('method, status')
        .eq('user_id', userData.id)
        .eq('status', 'enabled');

      if (mfaError) {
        console.error('Error checking MFA settings:', mfaError);
      }

      const hasMFA = mfaSettings && mfaSettings.length > 0;
      
      if (hasMFA) {
        // User has MFA enabled - don't sign them in yet, go straight to MFA challenge
        try {
          // Auto-send SMS challenge
          const { error: sendError } = await supabase.functions.invoke('send-mfa-challenge-sms', {
            body: { 
              email,
              method: 'sms'
            }
          });

          // Build URL params
          const params = new URLSearchParams();
          params.set('email', email);
          if (redirectTo) {
            params.set('redirect', redirectTo);
          }

          if (!sendError) {
            params.set('codeSent', 'true');
          } else {
            console.error('Error auto-sending SMS MFA code:', sendError);
          }

          navigate(`/auth/mfa-challenge?${params.toString()}`);
          return true;
        } catch (error) {
          console.error('Error in MFA flow:', error);
          const params = new URLSearchParams();
          params.set('email', email);
          if (redirectTo) {
            params.set('redirect', redirectTo);
          }
          navigate(`/auth/mfa-challenge?${params.toString()}`);
          return true;
        }
      }

      // No MFA enabled, proceed with normal sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive",
        });
        return false;
      }

      if (!authData.user) {
        toast({
          title: "Error", 
          description: "Sign in failed",
          variant: "destructive",
        });
        return false;
      }

      // Navigate to intended destination
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