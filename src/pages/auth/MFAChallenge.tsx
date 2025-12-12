import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const MFAChallenge = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Use ref to prevent double-sending in React Strict Mode
  const hasSentCodeRef = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Get user's phone from session
  const [userPhone, setUserPhone] = useState<string | null>(null);

  // Session timeout countdown (15 minutes)
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const initMFA = async () => {
      // Only send once - use ref to prevent double-send in React Strict Mode
      if (hasSentCodeRef.current) {
        logger.debug('Code already sent (ref check), skipping');
        return;
      }

      logger.debug('Initializing MFA - sending first code');
      hasSentCodeRef.current = true;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await handleSendCode();
      } else {
        setError('No active session. Please sign in again.');
      }
    };
    initMFA();
  }, []); // Empty dependency array - only run once

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
    setSendingCode(true);
    setError('');

    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('No active session. Please sign in again.');
        setSendingCode(false);
        return;
      }

      // Call our custom send-mfa-code Edge Function
      const { data, error } = await supabase.functions.invoke('send-mfa-code', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        setError(error.message || 'Failed to send code. Please try again.');
        setSendingCode(false);
        return;
      }

      if (!data.success) {
        setError(data.error || 'Failed to send code. Please try again.');
        setSendingCode(false);
        return;
      }

      // Update displayed phone number if returned
      if (data.phone) {
        setUserPhone(data.phone);
      }

      setCodeSent(true);
      setSendingCode(false);
    } catch (err) {
      logger.error('Error sending MFA code:', err);
      setError('Failed to send code. Please try again.');
      setSendingCode(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    logger.debug('🔵 handleVerify CALLED - Form submitted');
    logger.debug('🔵 Event type:', e.type);
    logger.debug('🔵 Current code value:', code);

    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

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
        setCode('');
        return;
      }

      if (!data || !data.success) {
        logger.error('Verification failed. Data:', data);
        const errorMsg = data?.error || 'Invalid code. Please try again.';
        logger.error('Error message:', errorMsg);
        setError(errorMsg);
        setLoading(false);
        setCode('');
        return;
      }

      logger.debug('Verification successful!');

      // Success! The Edge Function already called record_mfa_verification
      // Navigate to original destination
      navigate(from, { replace: true });
    } catch (err) {
      logger.error('Error verifying MFA code:', err);
      setError('Verification failed. Please try again.');
      setLoading(false);
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
    await handleSendCode();
  };

  const handleBackToSignIn = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      logger.error('Error signing out:', err);
    }
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
