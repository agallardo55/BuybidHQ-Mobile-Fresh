import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Phone, ArrowLeft } from "lucide-react";

interface MFAPasswordResetFormProps {
  email: string;
  mfaMethods: ('email' | 'sms')[];
  onBack: () => void;
}

export const MFAPasswordResetForm = ({ email, mfaMethods, onBack }: MFAPasswordResetFormProps) => {
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'sms' | null>(
    mfaMethods.length === 1 ? mfaMethods[0] : null
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { toast } = useToast();

  const sendMFACode = async (method: 'email' | 'sms') => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-mfa-reset-challenge', {
        body: { email, method }
      });

      if (error) {
        throw error;
      }

      setCodeSent(true);
      setSelectedMethod(method);
      toast({
        title: "Code Sent",
        description: `Verification code sent via ${method === 'email' ? 'email' : 'SMS'}`,
      });
    } catch (error: any) {
      console.error('Error sending MFA code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndReset = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('complete-mfa-password-reset', {
        body: { 
          email, 
          verificationCode: verificationCode.trim()
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setResetEmailSent(true);
        toast({
          title: "Success",
          description: "MFA verification successful! Check your email for the password reset link.",
        });
      } else {
        toast({
          title: "Invalid Code",
          description: data?.error || "The verification code is incorrect or expired",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error verifying MFA code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resendCode = async () => {
    if (selectedMethod) {
      setVerificationCode("");
      await sendMFACode(selectedMethod);
    }
  };

  if (resetEmailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Check Your Email</h3>
          <p className="text-sm text-gray-600 mt-2">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            The link will expire in 60 minutes. You can close this page now.
          </p>
        </div>
      </div>
    );
  }

  if (!selectedMethod) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Choose Verification Method</h3>
          <p className="text-sm text-gray-600 mt-2">
            Your account has multi-factor authentication enabled. Please choose how you'd like to verify your identity.
          </p>
        </div>
        
        <div className="space-y-3">
          {mfaMethods.includes('email') && (
            <Button
              onClick={() => sendMFACode('email')}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3"
              variant="outline"
            >
              <Mail className="w-4 h-4" />
              <span>Send code via Email</span>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </Button>
          )}
          
          {mfaMethods.includes('sms') && (
            <Button
              onClick={() => sendMFACode('sms')}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3"
              variant="outline"
            >
              <Phone className="w-4 h-4" />
              <span>Send code via SMS</span>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </Button>
          )}
        </div>

        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Enter Verification Code</h3>
        <p className="text-sm text-gray-600 mt-2">
          We've sent a verification code to {selectedMethod === 'email' ? 'your email' : 'your phone'}. 
          Enter it below to continue with password reset.
        </p>
      </div>

      <div>
        <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
          Verification Code
        </label>
        <Input
          id="verification-code"
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter 6-digit code"
          maxLength={6}
          className="mt-1 text-center text-lg tracking-widest"
          disabled={isVerifying}
        />
      </div>

      <Button
        onClick={verifyAndReset}
        disabled={isVerifying || !verificationCode.trim()}
        className="w-full bg-accent hover:bg-accent/90"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Verifying...
          </>
        ) : (
          'Verify & Send Reset Link'
        )}
      </Button>

      <div className="text-center space-y-2">
        <Button
          onClick={resendCode}
          variant="ghost"
          size="sm"
          disabled={isLoading}
        >
          Resend Code
        </Button>
        
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back</span>
        </Button>
      </div>
    </div>
  );
};