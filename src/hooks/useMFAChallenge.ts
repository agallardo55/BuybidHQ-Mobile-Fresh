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

        // Try to get available MFA methods from URL params first
        const urlParams = new URLSearchParams(window.location.search);
        const methodsParam = urlParams.get('methods');
        
        if (methodsParam) {
          const methods = methodsParam.split(',') as MFAMethod[];
          setAvailableMethods(methods);
          
          // Auto-select if only one method
          if (methods.length === 1) {
            setSelectedMethod(methods[0]);
          }
        } else {
          // Fallback: assume email MFA is available
          const methods: MFAMethod[] = ['email'];
          setAvailableMethods(methods);
          
          if (methods.length === 1) {
            setSelectedMethod(methods[0]);
          }
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

      if (method === 'email') {
        // Use Supabase native OTP for email
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false, // Don't create new users during MFA
          }
        });

        if (error) {
          console.error('Error sending OTP via email:', error);
          setError('Failed to send email verification code');
          return false;
        }
      } else if (method === 'sms') {
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
      } else {
        setError(`${method} verification is not supported`);
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

  const verifyMFAChallenge = async (method: MFAMethod, code: string): Promise<boolean> => {
    if (!email || !code) return false;

    try {
      setIsVerifying(true);
      setError(null);

      if (method === 'email') {
        // Use Supabase native OTP verification
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: 'email'
        });

        if (error) {
          console.error('Error verifying OTP:', error);
          setError('Invalid verification code');
          return false;
        }
      } else if (method === 'sms') {
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
        const { error: signInError } = await supabase.functions.invoke('complete-mfa-login', {
          body: { 
            email
          }
        });

        if (signInError) {
          console.error('Error completing SMS MFA login:', signInError);
          setError('Login completion failed');
          return false;
        }
      } else {
        setError(`${method} verification is not supported`);
        return false;
      }

      // MFA verification successful - user is now authenticated
      
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