import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailCheckResult {
  isChecking: boolean;
  isAvailable: boolean | null;
  message: string;
}

/**
 * Hook to check email availability during signup
 * Debounces the check by 500ms to avoid excessive API calls
 * 
 * @param email - The email address to check
 * @param enabled - Whether to enable the check (default: true)
 * @returns Object with checking state, availability status, and message
 */
export const useEmailAvailability = (email: string, enabled: boolean = true) => {
  const [result, setResult] = useState<EmailCheckResult>({
    isChecking: false,
    isAvailable: null,
    message: '',
  });

  useEffect(() => {
    // Don't check if email is empty or checking is disabled
    if (!email || !enabled) {
      setResult({ isChecking: false, isAvailable: null, message: '' });
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setResult({ isChecking: false, isAvailable: null, message: '' });
      return;
    }

    // Debounce the check by 500ms
    const timeoutId = setTimeout(async () => {
      setResult({ isChecking: true, isAvailable: null, message: 'Checking availability...' });

      try {
        // Call the database function to check if email exists
        const { data, error } = await supabase.rpc('check_email_exists', {
          email_to_check: email.toLowerCase().trim()
        });

        if (error) {
          console.error('Email check error:', error);
          // Fail gracefully - don't block signup if check fails
          setResult({
            isChecking: false,
            isAvailable: null,
            message: '',
          });
          return;
        }

        if (data === true) {
          // Email is already registered
          setResult({
            isChecking: false,
            isAvailable: false,
            message: 'This email is already registered.',
          });
        } else {
          // Email is available
          setResult({
            isChecking: false,
            isAvailable: true,
            message: 'Email is available',
          });
        }
      } catch (error) {
        console.error('Email availability check failed:', error);
        // Fail gracefully - don't block signup if check fails
        setResult({
          isChecking: false,
          isAvailable: null,
          message: '',
        });
      }
    }, 500); // 500ms debounce

    // Cleanup timeout on unmount or when email changes
    return () => clearTimeout(timeoutId);
  }, [email, enabled]);

  return result;
};

