import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MFAMethod } from "@/types/mfa";

export const useMFAChallenge = (email: string | null) => {
  const { toast } = useToast();
  const [availableMethods, setAvailableMethods] = useState<MFAMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<MFAMethod | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available MFA methods for the user
  useEffect(() => {
    if (!email) return;

    const loadAvailableMethods = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user ID from email
        const { data: users, error: userError } = await supabase
          .from('buybidhq_users')
          .select('id')
          .eq('email', email)
          .single();

        if (userError || !users) {
          setError('User not found');
          return;
        }

        // Get enabled MFA methods for this user
        const { data: mfaSettings, error: mfaError } = await supabase
          .from('mfa_settings')
          .select('method')
          .eq('user_id', users.id)
          .eq('status', 'enabled');

        if (mfaError) {
          console.error('Error loading MFA methods:', mfaError);
          setError('Failed to load MFA methods');
          return;
        }

        const methods = mfaSettings?.map(setting => setting.method as MFAMethod) || [];
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
  }, [email]);

  const sendMFAChallenge = async (method: MFAMethod): Promise<boolean> => {
    if (!email) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('buybidhq_users')
        .select('id, mobile_number')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        setError('User not found');
        return false;
      }

      if (method === 'sms' && !userData.mobile_number) {
        setError('No mobile number configured for SMS');
        return false;
      }

      // Call the appropriate edge function based on method
      const functionName = method === 'email' ? 'create-mfa-verification' : 'send-mfa-sms';
      const body = method === 'email' 
        ? { method }
        : { method, phoneNumber: userData.mobile_number };

      const { error: functionError } = await supabase.functions.invoke(functionName, {
        body,
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (functionError) {
        console.error(`Error calling ${functionName}:`, functionError);
        setError(`Failed to send ${method} verification code`);
        return false;
      }

      setVerificationCode(''); // Reset to show input
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

      // Get user ID
      const { data: userData, error: userError } = await supabase
        .from('buybidhq_users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        setError('User not found');
        return false;
      }

      // Verify the MFA code
      const { data: verificationResult, error: verifyError } = await supabase.rpc(
        'verify_mfa_code',
        {
          p_user_id: userData.id,
          p_verification_code: code
        }
      );

      if (verifyError) {
        console.error('Error verifying MFA code:', verifyError);
        setError('Verification failed');
        return false;
      }

      const result = verificationResult?.[0];
      if (!result?.is_valid) {
        setError(result?.error_message || 'Invalid verification code');
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
      await sendMFAChallenge(selectedMethod);
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
    sendMFAChallenge,
    verifyMFAChallenge,
    resendCode,
  };
};