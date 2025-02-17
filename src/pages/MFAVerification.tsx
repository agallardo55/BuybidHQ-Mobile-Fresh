
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PendingMFASession {
  userId: string;
  verificationId: string;
  method: 'email' | 'sms';
  destination: string;
}

const MFAVerification = () => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const navigate = useNavigate();
  const [pendingSession, setPendingSession] = useState<PendingMFASession | null>(null);

  // Load pending session
  useEffect(() => {
    const sessionData = sessionStorage.getItem('pending_mfa_session');
    if (!sessionData) {
      navigate('/signin');
      return;
    }
    setPendingSession(JSON.parse(sessionData));
  }, [navigate]);

  // Handle timer countdown
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle PIN input
  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`pin-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pendingSession) {
      toast.error("Session expired. Please sign in again.");
      navigate('/signin');
      return;
    }

    if (pin.some(digit => !digit)) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      const enteredPin = pin.join('');
      
      // Verify MFA code
      const { data: verificationResult, error: verificationError } = await supabase
        .rpc('verify_mfa_code', {
          p_user_id: pendingSession.userId,
          p_verification_code: enteredPin
        });

      if (verificationError) throw verificationError;

      if (verificationResult.is_valid) {
        // Clear pending session
        sessionStorage.removeItem('pending_mfa_session');
        
        toast.success("Verification successful!");
        navigate(pendingSession.destination);
      } else {
        setAttemptsRemaining(verificationResult.attempts_remaining);
        toast.error(verificationResult.error_message || "Invalid PIN. Please try again.");
        
        if (verificationResult.attempts_remaining <= 0) {
          navigate('/signin');
        }
      }
    } catch (error: any) {
      console.error("MFA verification error:", error);
      toast.error(error.message || "Failed to verify PIN");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (!pendingSession) {
      toast.error("Session expired. Please sign in again.");
      navigate('/signin');
      return;
    }

    setIsLoading(true);
    try {
      const { data: verificationData, error: verificationError } = await supabase
        .rpc('create_mfa_verification', {
          p_user_id: pendingSession.userId,
          p_method: pendingSession.method
        });

      if (verificationError) throw verificationError;

      // Update session storage with new verification ID
      sessionStorage.setItem('pending_mfa_session', JSON.stringify({
        ...pendingSession,
        verificationId: verificationData.verification_id
      }));

      setTimeRemaining(300); // Reset timer
      setAttemptsRemaining(3); // Reset attempts
      toast.success("New code sent successfully");
    } catch (error: any) {
      console.error("Resend code error:", error);
      toast.error(error.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <img 
            src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
            alt="BuyBidHQ Logo" 
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Verify Your Identity</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 6-digit code sent to your {pendingSession?.method === 'email' ? 'email' : 'phone'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex justify-between space-x-2">
              {pin.map((digit, index) => (
                <Input
                  key={index}
                  id={`pin-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-xl font-semibold"
                  disabled={isLoading}
                  autoComplete="off"
                />
              ))}
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Time remaining: {formatTime(timeRemaining)}</span>
              <span>{attemptsRemaining} attempts remaining</span>
            </div>

            {timeRemaining === 0 && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-sm font-medium text-[#325AE7] hover:text-[#325AE7]/90"
                  disabled={isLoading}
                >
                  Resend code
                </button>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90"
            disabled={isLoading || timeRemaining === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>

          <Link 
            to="/signin" 
            className="block text-center text-sm text-[#325AE7] hover:text-[#325AE7]/90"
          >
            ← Back to Sign In
          </Link>
        </form>
      </div>
    </div>
  );
};

export default MFAVerification;
