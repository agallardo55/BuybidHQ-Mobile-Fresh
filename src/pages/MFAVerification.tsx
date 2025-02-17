
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const MFAVerification = () => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const navigate = useNavigate();

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
    
    if (pin.some(digit => !digit)) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual PIN verification logic
      const enteredPin = pin.join('');
      console.log('Verifying PIN:', enteredPin);

      // Simulate verification (remove this in actual implementation)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (attemptsRemaining > 1) {
        setAttemptsRemaining(prev => prev - 1);
        toast.error("Invalid PIN. Please try again.");
      } else {
        // Handle locked out state
        toast.error("Too many failed attempts. Please try again later.");
        navigate('/signin');
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
    setIsLoading(true);
    try {
      // TODO: Implement actual resend logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTimeRemaining(300); // Reset timer
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
            Enter the 6-digit code sent to your device
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
