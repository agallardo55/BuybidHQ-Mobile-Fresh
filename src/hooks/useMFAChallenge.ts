import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MFAMethod } from "@/types/mfa";

// Rate limiting configuration
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes
const CHALLENGE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN = 60 * 1000; // 60 seconds

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
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);
  const [challengeStartTime, setChallengeStartTime] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [maskedPhone, setMaskedPhone] = useState<string>('');

  // Initialize challenge timer
  useEffect(() => {
    if (codeSent && challengeStartTime === 0) {
      setChallengeStartTime(Date.now());
    }
  }, [codeSent, challengeStartTime]);

  // Check for challenge timeout
  useEffect(() => {
    if (!challengeStartTime) return;

    const checkTimeout = () => {
      const elapsed = Date.now() - challengeStartTime;
      if (elapsed > CHALLENGE_TIMEOUT) {
        setError('Challenge expired. Please start over.');
        setCodeSent(false);
        setChallengeStartTime(0);
      }
    };

    const interval = setInterval(checkTimeout, 1000);
    return () => clearInterval(interval);
  }, [challengeStartTime]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    
    // Reset attempts if outside the window
    if (now - lastAttemptTime > ATTEMPT_WINDOW) {
      setAttemptCount(0);
      setLastAttemptTime(0);
    }

    if (attemptCount >= MAX_ATTEMPTS) {
      setError(`Too many attempts. Please try again in ${Math.ceil((ATTEMPT_WINDOW - (now - lastAttemptTime)) / 60000)} minutes.`);
      return false;
    }

    return true;
  };

  const sendMFAChallenge = async (): Promise<boolean> => {
    if (!email) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Use edge function for SMS MFA challenge
      const { data, error } = await supabase.functions.invoke('send-mfa-challenge-sms', {
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

      // Extract masked phone from response
      if (data?.maskedPhone) {
        setMaskedPhone(data.maskedPhone);
      }

      setVerificationCode(''); // Reset to show input
      setCodeSent(true); // Show verification code section
      setChallengeStartTime(Date.now());
      setResendCooldown(RESEND_COOLDOWN);

      toast({
        title: "Code Sent",
        description: `Verification code sent to ${data?.maskedPhone || 'your phone'}`,
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

  const verifyMFAChallenge = async (code: string): Promise<boolean> => {
    if (!email || !code) return false;

    // Check rate limiting
    if (!checkRateLimit()) {
      return false;
    }

    try {
      setIsVerifying(true);
      setError(null);

      // Use Supabase's native MFA verification
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const phoneFactor = factors?.phone?.[0];
      
      if (!phoneFactor) {
        setError('No phone factor found');
        return false;
      }

      // Send challenge first
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: phoneFactor.id
      });

      if (challengeError) {
        console.error('Error creating MFA challenge:', challengeError);
        setError('Failed to create verification challenge');
        return false;
      }

      // Verify the code
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: phoneFactor.id,
        challengeId: challengeData.id,
        code: code
      });

      if (verifyError) {
        console.error('Error verifying MFA code:', verifyError);
        setAttemptCount(prev => prev + 1);
        setLastAttemptTime(Date.now());
        
        if (attemptCount + 1 >= 3) {
          // Auto-logout after 3 failures
          toast({
            title: "Security Alert",
            description: "Too many failed attempts. Logging out for security.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return false;
        } else {
          setError('Invalid code. Try again.');
          return false;
        }
      }

      // Success - session upgraded to AAL2
      toast({
        title: "Verified!",
        description: "Multi-factor authentication successful",
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
    if (resendCooldown > 0) return;
    
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
    attemptCount,
    resendCooldown,
    maskedPhone,
  };
};