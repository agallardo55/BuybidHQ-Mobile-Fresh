import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MFAMethod } from "@/types/mfa";

export const useMFAChallenge = (
  email: string | null, 
  initialMethod?: MFAMethod | null,
  initialCodeSent?: boolean
) => {
  const { toast } = useToast();
  const [availableMethods, setAvailableMethods] = useState<MFAMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<MFAMethod | null>(initialMethod || null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(!initialMethod); // Skip loading if method provided
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(initialCodeSent || false);

  // Load available MFA methods for the user (skip if method already provided)
  useEffect(() => {
    if (!email || initialMethod) {
      // If method is provided via URL params, set it and skip loading
      if (initialMethod) {
        setAvailableMethods([initialMethod]);
        setSelectedMethod(initialMethod);
        setIsLoading(false);
      }
      return;
    }

    const loadAvailableMethods = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Call edge function to get MFA methods (bypasses RLS since user is signed out)
        const { data, error } = await supabase.functions.invoke('get-user-mfa-methods', {
          body: { email }
        });

        if (error) {
          console.error('Error loading MFA methods:', error);
          setError('Failed to load MFA methods');
          return;
        }

        const methods = data?.methods || [];
        setAvailableMethods(methods);

        // Auto-select if only one method
        if (methods.length === 1) {
          setSelectedMethod(methods[0]);
        }
      } catch (err: any) {
        console.error('Error in loadAvailableMethods:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailableMethods();
  }, [email, initialMethod]);

  const sendMFAChallenge = async (method: MFAMethod): Promise<boolean> => {
    if (!email) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Call the appropriate edge function based on method
      const functionName = method === 'email' ? 'send-mfa-challenge-email' : 'send-mfa-challenge-sms';
      const { error: functionError } = await supabase.functions.invoke(functionName, {
        body: { email, method }
      });

      if (functionError) {
        console.error(`Error calling ${functionName}:`, functionError);
        setError(`Failed to send ${method} verification code`);
        return false;
      }

      setVerificationCode(''); // Reset to show input
      setCodeSent(true); // Show verification code section
      toast({
        title: "Code Sent",
        description: `Verification code sent via ${method === 'email' ? 'email' : 'SMS'}`,
      });

      return true;
    } catch (err: any) {
      console.error('Error sending MFA challenge:', err);
      setError('Failed to send verification code');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFAChallenge = async (method: MFAMethod, code: string): Promise<boolean> => {
    if (!email || !code) return false;

    try {
      setIsVerifying(true);
      setError(null);

      // Call edge function to verify MFA code
      const { data, error: functionError } = await supabase.functions.invoke('verify-mfa-challenge', {
        body: { email, code }
      });

      if (functionError) {
        console.error('Error verifying MFA code:', functionError);
        setError('Verification failed');
        return false;
      }

      if (!data?.success) {
        setError(data?.error || 'Invalid verification code');
        return false;
      }

      // MFA verification successful - complete the authentication
      // The actual login completion should be handled by the calling component
      toast({
        title: "Success",
        description: "Multi-factor authentication verified successfully",
      });

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
    if (selectedMethod) {
      setVerificationCode('');
      setCodeSent(false); // Reset code sent state
      const success = await sendMFAChallenge(selectedMethod);
      // codeSent will be set to true in sendMFAChallenge if successful
    }
  };

  return {
    availableMethods,
    selectedMethod,
    setSelectedMethod,
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