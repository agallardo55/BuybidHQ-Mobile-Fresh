import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';

const MFAChallenge = () => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Use ref to prevent double-sending in React Strict Mode
  const hasSentCodeRef = useRef(false);

  // Use ref to prevent double-submission of verification
  const isVerifyingRef = useRef(false);

  // Use ref to prevent spamming resend button
  const lastResendTimeRef = useRef<number>(0);

  // Use ref to prevent duplicate handleSendCode calls
  const isSendingCodeRef = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Check both navigation state AND sessionStorage for isInitialSignIn flag
  const isInitialSignInFromState = location.state?.isInitialSignIn || false;
  const isInitialSignInFromStorage = sessionStorage.getItem('mfa_is_initial_signin') === 'true';
  const isInitialSignIn = isInitialSignInFromState || isInitialSignInFromStorage;

  // Get user's phone from session
  const [userPhone, setUserPhone] = useState<string | null>(null);

  // Session timeout countdown (15 minutes)
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [sessionExpired, setSessionExpired] = useState(false);

  // DEBUG: Log navigation state only when it changes
  useEffect(() => {
    logger.debug('🔐 MFAChallenge - Navigation State:', {
      fullLocationState: location.state,
      isInitialSignInFromState,
      isInitialSignInFromStorage,
      isInitialSignIn,
      from,
    });
  }, [location.state, isInitialSignInFromState, isInitialSignInFromStorage, isInitialSignIn, from]);

  useEffect(() => {
    const initMFA = async () => {
      // Get user's phone number for display from AuthContext
      if (!user) {
        setError('No active session. Please sign in again.');
        return;
      }

      // Try to get phone from user object
      let phone = user.phone;
      if (!phone) {
        // Fallback: check buybidhq_users.mobile_number
        const { data: userData } = await supabase
          .from('buybidhq_users')
          .select('mobile_number')
          .eq('id', user.id)
          .single();

        phone = userData?.mobile_number;
      }

      if (phone) {
        // Mask phone number for display
        // Strip non-digits and remove leading country code (1) if present
        const digits = phone.replace(/\D/g, '');
        const last10 = digits.slice(-10); // Get last 10 digits (ignore country code)
        const masked = last10.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        setUserPhone(masked);
      }

      // Only auto-send on INITIAL sign-in, not on subsequent navigations/refreshes
      if (!isInitialSignIn) {
        logger.debug('Not initial sign-in - user must manually click "Send Code"');
        return;
      }

      // Only send once - use ref to prevent double-send in React Strict Mode
      if (hasSentCodeRef.current) {
        logger.debug('Code already sent (ref check), skipping');
        return;
      }

      // Check sessionStorage to prevent sending on page refresh/navigation
      const sessionKey = 'mfa_code_sent_timestamp';
      const sessionUserKey = 'mfa_code_sent_user';
      const lastSentTime = sessionStorage.getItem(sessionKey);
      const lastSentUser = sessionStorage.getItem(sessionUserKey);
      const now = Date.now();

      // Only skip if code was sent less than 1 minute ago AND for the same user
      if (lastSentTime && lastSentUser === user?.id && (now - parseInt(lastSentTime)) < 60 * 1000) {
        logger.debug('Code already sent recently (session check), skipping');
        hasSentCodeRef.current = true;
        setCodeSent(true);
        return;
      }

      logger.debug('Initializing MFA - sending first code (initial sign-in)');
      hasSentCodeRef.current = true;

      await handleSendCode();
      // Store timestamp and user ID to prevent resending on refresh
      sessionStorage.setItem(sessionKey, now.toString());
      if (user?.id) {
        sessionStorage.setItem(sessionUserKey, user.id);
      }
    };
    initMFA();
  }, [isInitialSignIn, user]); // Re-run if isInitialSignIn or user changes

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setSessionExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSendCode = async () => {
    logger.debug('🔴 handleSendCode CALLED - Sending new MFA code');
    logger.debug('🔴 Call stack:', new Error().stack);

    // Prevent duplicate calls if already sending
    if (isSendingCodeRef.current) {
      logger.debug('🔴 BLOCKED: Already sending code, ignoring duplicate call');
      return;
    }

    isSendingCodeRef.current = true;
    setSendingCode(true);
    setError('');

    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('No active session. Please sign in again.');
        isSendingCodeRef.current = false;
        setSendingCode(false);
        return;
      }

      // Call our custom send-mfa-code Edge Function
      logger.debug('🔴 Invoking send-mfa-code edge function...');
      const { data, error } = await supabase.functions.invoke('send-mfa-code', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      logger.debug('🔴 send-mfa-code response:', { data, error });

      if (error) {
        logger.error('🔴 send-mfa-code error:', error);
        setError(error.message || 'Failed to send code. Please try again.');
        isSendingCodeRef.current = false;
        setSendingCode(false);
        return;
      }

      if (!data?.success) {
        logger.error('🔴 send-mfa-code failed:', data);
        setError(data?.error || 'Failed to send code. Please try again.');
        isSendingCodeRef.current = false;
        setSendingCode(false);
        return;
      }

      logger.debug('🔴 send-mfa-code SUCCESS - code sent to:', data.phone);

      // Update displayed phone number if returned (format it properly)
      if (data.phone) {
        const digits = data.phone.replace(/\D/g, '');
        const last10 = digits.slice(-10);
        const formatted = last10.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        setUserPhone(formatted);
      }

      setCodeSent(true);
      isSendingCodeRef.current = false;
      setSendingCode(false);
    } catch (err) {
      logger.error('Error sending MFA code:', err);
      setError('Failed to send code. Please try again.');
      isSendingCodeRef.current = false;
      setSendingCode(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    logger.debug('🔵 handleVerify CALLED - Form submitted');
    logger.debug('🔵 Event type:', e.type);
    logger.debug('🔵 Current code value:', code);

    // Prevent double-submission using ref
    if (isVerifyingRef.current) {
      logger.debug('🔵 BLOCKED: Already verifying, ignoring duplicate submission');
      return;
    }

    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    isVerifyingRef.current = true;
    setLoading(true);
    setError('');

    // Debug logging
    logger.debug('=== MFA VERIFICATION DEBUG ===');
    logger.debug('Sending code to verify:', code);
    logger.debug('Code length:', code.length);
    logger.debug('Code type:', typeof code);
    logger.debug('Code value (JSON):', JSON.stringify(code));

    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('No active session. Please sign in again.');
        setLoading(false);
        return;
      }

      logger.debug('Session token exists, calling verify-mfa-code Edge Function');

      // Call our custom verify-mfa-code Edge Function
      const { data, error } = await supabase.functions.invoke('verify-mfa-code', {
        body: { code },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      logger.debug('=== EDGE FUNCTION FULL RESPONSE ===');
      logger.debug('Response data:', JSON.stringify(data, null, 2));
      logger.warn('Response error:', JSON.stringify(error, null, 2));

      if (error) {
        logger.error('Edge Function error object:', error);
        logger.error('Error details:', {
          message: error.message,
          name: error.name,
          context: error.context,
          details: error
        });

        // Check if error response has additional details
        if (data?.error) {
          logger.error('Error from Edge Function response:', data.error);
        }

        setError(error.message || data?.error || 'Verification failed. Please try again.');
        setLoading(false);
        isVerifyingRef.current = false;
        setCode('');
        return;
      }

      if (!data || !data.success) {
        logger.error('Verification failed. Data:', data);
        const errorMsg = data?.error || 'Invalid code. Please try again.';
        logger.error('Error message:', errorMsg);
        setError(errorMsg);
        setLoading(false);
        isVerifyingRef.current = false;
        setCode('');
        return;
      }

      logger.debug('Verification successful!');

      // Success! The Edge Function already called record_mfa_verification
      // Reset the verifying flag before navigation
      isVerifyingRef.current = false;

      // Clear sessionStorage timestamps and initial sign-in flag
      sessionStorage.removeItem('mfa_code_sent_timestamp');
      sessionStorage.removeItem('mfa_code_sent_user');
      sessionStorage.removeItem('mfa_is_initial_signin');

      // Navigate to original destination
      navigate(from, { replace: true });
    } catch (err) {
      logger.error('Error verifying MFA code:', err);
      setError('Verification failed. Please try again.');
      setLoading(false);
      isVerifyingRef.current = false;
      setCode('');
    }
  };

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    setCode(digits.slice(0, 6));
    setError('');
  };

  const handleResendCode = async () => {
    logger.debug('🟡 handleResendCode CALLED - User clicked resend button');

    // Prevent spamming - require at least 30 seconds between resend attempts
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTimeRef.current;
    const minResendInterval = 30 * 1000; // 30 seconds

    if (timeSinceLastResend < minResendInterval) {
      const secondsRemaining = Math.ceil((minResendInterval - timeSinceLastResend) / 1000);
      setError(`Please wait ${secondsRemaining} seconds before requesting another code.`);
      logger.debug(`🟡 BLOCKED: Resend too soon. Wait ${secondsRemaining} more seconds.`);
      return;
    }

    lastResendTimeRef.current = now;
    await handleSendCode();
  };

  const handleBackToSignIn = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      logger.error('Error signing out:', err);
    }
    // Clear sessionStorage timestamps and initial sign-in flag
    sessionStorage.removeItem('mfa_code_sent_timestamp');
    sessionStorage.removeItem('mfa_code_sent_user');
    sessionStorage.removeItem('mfa_is_initial_signin');
    navigate('/signin', { replace: true });
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if time is running low (< 2 minutes)
  const isTimeRunningLow = timeRemaining < 120;

  if (sessionExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Session Expired
            </h2>
            <p className="text-gray-600 mb-6">
              Your verification session has expired. Please sign in again to continue.
            </p>
            <button
              onClick={handleBackToSignIn}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show "Send Code" button if not initial sign-in and code not sent yet
  if (!isInitialSignIn && !codeSent && !sendingCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Required
            </h2>
            <p className="text-gray-600 mb-6">
              To continue, we need to verify your identity via text message.
              {userPhone && (
                <>
                  <br />
                  <span className="font-semibold mt-2 inline-block">
                    We'll send a code to: {userPhone}
                  </span>
                </>
              )}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSendCode}
              disabled={sendingCode}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
            >
              {sendingCode ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Verification Code'
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToSignIn}
              className="w-full text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Identity
          </h2>
          <p className="text-gray-600">
            {codeSent ? (
              <>
                Enter the 6-digit code sent to{' '}
                <span className="font-semibold">{userPhone}</span>
              </>
            ) : (
              'Sending verification code...'
            )}
          </p>
        </div>

        {/* Session Timeout Warning */}
        <div className={`mb-6 p-4 rounded-lg border ${
          isTimeRunningLow 
            ? 'bg-red-50 border-red-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg 
                className={`w-5 h-5 mr-2 ${isTimeRunningLow ? 'text-red-600' : 'text-blue-600'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-sm font-medium ${isTimeRunningLow ? 'text-red-700' : 'text-blue-700'}`}>
                {isTimeRunningLow ? 'Time running out!' : 'Time remaining:'}
              </span>
            </div>
            <span className={`text-lg font-mono font-bold ${isTimeRunningLow ? 'text-red-700' : 'text-blue-700'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          {isTimeRunningLow && (
            <p className="text-xs text-red-600 mt-2">
              Complete verification now or you'll need to sign in again.
            </p>
          )}
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-center text-3xl font-mono tracking-[0.5em] focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              autoComplete="one-time-code"
              autoFocus
              disabled={loading || sendingCode}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6 || sendingCode}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify Code'
            )}
          </button>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={sendingCode || loading}
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sendingCode ? 'Sending...' : "Didn't receive a code? Resend"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-4">
            This verification is required once every 24 hours for your security.
          </p>
          <button
            type="button"
            onClick={handleBackToSignIn}
            className="w-full text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default MFAChallenge;
