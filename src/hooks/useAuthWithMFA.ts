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

      // Check if user has MFA enabled
      const { data: mfaSettings, error: mfaError } = await supabase
        .from('mfa_settings')
        .select('method, status')
        .eq('user_id', authData.user.id)
        .eq('status', 'enabled');

      if (mfaError) {
        console.error('Error checking MFA settings:', mfaError);
        // Continue with normal login if we can't check MFA settings
      }

      // If MFA is enabled, sign out temporarily and auto-send MFA code
      if (mfaSettings && mfaSettings.length > 0) {
        // Sign out the session since we need to complete MFA first
        await supabase.auth.signOut();
        
        try {
          // Get available MFA methods using edge function
          const { data: methodsData, error: methodsError } = await supabase.functions.invoke('get-user-mfa-methods', {
            body: { email }
          });

          if (methodsError) {
            console.error('Error getting MFA methods:', methodsError);
            // Fall back to manual flow
            const params = new URLSearchParams();
            params.set('email', email);
            if (redirectTo) {
              params.set('redirect', redirectTo);
            }
            navigate(`/auth/mfa-challenge?${params.toString()}`);
            return true;
          }

          const availableMethods = methodsData?.methods || [];
          // Priority: email first, then SMS
          const selectedMethod = availableMethods.includes('email') ? 'email' : availableMethods[0];

          if (selectedMethod) {
            // Auto-send MFA code
            const functionName = selectedMethod === 'email' ? 'send-mfa-challenge-email' : 'send-mfa-challenge-sms';
            const { error: sendError } = await supabase.functions.invoke(functionName, {
              body: { email, method: selectedMethod }
            });

            // Build URL params with method and code-sent status
            const params = new URLSearchParams();
            params.set('email', email);
            params.set('method', selectedMethod);
            if (redirectTo) {
              params.set('redirect', redirectTo);
            }

            if (!sendError) {
              // Code sent successfully
              params.set('codeSent', 'true');
              toast({
                title: "Code Sent",
                description: `Verification code sent via ${selectedMethod === 'email' ? 'email' : 'SMS'}`,
              });
            } else {
              console.error('Error auto-sending MFA code:', sendError);
              // Fall back to manual sending
            }

            navigate(`/auth/mfa-challenge?${params.toString()}`);
            return true;
          }
        } catch (error) {
          console.error('Error in auto-send MFA flow:', error);
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
      toast({
        title: "Success",
        description: "Signed in successfully",
      });

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

      // Call edge function to complete MFA login
      const { data, error } = await supabase.functions.invoke('complete-mfa-login', {
        body: { email, redirectTo }
      });

      if (error || !data?.success) {
        console.error('Error completing MFA login:', error);
        toast({
          title: "Error",
          description: "Failed to complete login",
          variant: "destructive",
        });
        return false;
      }

      // If we get a login URL, redirect to it
      if (data.loginUrl) {
        window.location.href = data.loginUrl;
        return true;
      }

      toast({
        title: "Success",
        description: "Login completed successfully",
      });

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