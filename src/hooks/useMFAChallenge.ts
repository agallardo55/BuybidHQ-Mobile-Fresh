import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MFAMethod } from "@/types/mfa";

export const useMFAChallenge = (
  email: string | null, 
  initialCodeSent?: boolean
) => {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(initialCodeSent || false);

  const sendMFAChallenge = async (): Promise<boolean> => {
    if (!email) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Use edge function for SMS MFA challenge
      const { error } = await supabase.functions.invoke('send-mfa-challenge-sms', {
        body: { 
          email,
          method: 'sms'
        }
      });

      if (error) {
        console.error('Error sending SMS MFA challenge:', error);
        setError('Failed to send SMS verification code');
        return false;
      }

      setVerificationCode(''); // Reset to show input
      setCodeSent(true); // Show verification code section

      return true;
    } catch (err: any) {
      console.error('Error sending MFA challenge:', err);
      setError('Failed to send verification code');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFAChallenge = async (code: string): Promise<boolean> => {
    if (!email || !code) return false;

    try {
      setIsVerifying(true);
      setError(null);

      // Use edge function for SMS MFA verification
      const { data, error } = await supabase.functions.invoke('verify-mfa-challenge', {
        body: { 
          email,
          code
        }
      });

      if (error || !data?.success) {
        console.error('Error verifying SMS MFA:', error);
        setError(data?.error || 'Invalid verification code');
        return false;
      }

      // For SMS MFA, we need to complete the login manually since Supabase native auth isn't used
      const { data: loginData, error: signInError } = await supabase.functions.invoke('complete-mfa-login', {
        body: { 
          email
        }
      });

      if (signInError || !loginData?.loginUrl) {
        console.error('Error completing SMS MFA login:', signInError);
        setError('Login completion failed');
        return false;
      }

      // Redirect to the magic link to complete authentication
      window.location.href = loginData.loginUrl;
      return true;
    } catch (err: any) {
      console.error('Error verifying MFA challenge:', err);
      setError('Verification failed');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const resendCode = async () => {
    setVerificationCode('');
    setCodeSent(false); // Reset code sent state
    const success = await sendMFAChallenge();
    // codeSent will be set to true in sendMFAChallenge if successful
  };

  return {
    verificationCode,
    setVerificationCode,
    isLoading,
    isVerifying,
    error,
    codeSent,
    sendMFAChallenge,
    verifyMFAChallenge,
    resendCode,
  };
};