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

      // First, attempt regular sign in
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

      // Check if user has MFA enabled - only redirect if explicitly enabled
      const { data: mfaSettings, error: mfaError } = await supabase
        .from('mfa_settings')
        .select('method, status')
        .eq('user_id', authData.user.id)
        .eq('status', 'enabled');

      if (mfaError) {
        console.error('Error checking MFA settings:', mfaError);
        // Continue with normal login if we can't check MFA settings
      }

      console.log('MFA Settings for user:', { userId: authData.user.id, mfaSettings });

      // Only redirect to MFA if user has explicitly enabled MFA settings
      const shouldUseMFA = true; // MFA system activated
      
      if (shouldUseMFA && mfaSettings && mfaSettings.length > 0) {
        // Sign out the session since we need to complete MFA first
        await supabase.auth.signOut();
        
        try {
          // Check available MFA methods - only SMS is supported now
          const hasSMSMFA = mfaSettings.some(setting => setting.method === 'sms');
          
          if (hasSMSMFA) {
            // Auto-send SMS challenge for SMS users
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
              // Code sent successfully
              params.set('codeSent', 'true');
            } else {
              console.error('Error auto-sending SMS MFA code:', sendError);
              // Fall back to manual sending
            }

            navigate(`/auth/mfa-challenge?${params.toString()}`);
            return true;
          } else {
            // No SMS MFA enabled, should not happen but fallback to normal login
            console.warn('User has MFA enabled but no SMS method found');
          }
        } catch (error) {
          console.error('Error in MFA flow:', error);
          // Fall back to manual flow
          const params = new URLSearchParams();
          params.set('email', email);
          if (redirectTo) {
            params.set('redirect', redirectTo);
          }
          navigate(`/auth/mfa-challenge?${params.toString()}`);
          return true;
        }
      }

      // No MFA enabled, normal sign in successful
      
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