
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MFAPasswordResetForm } from "@/components/MFAPasswordResetForm";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showMFAForm, setShowMFAForm] = useState(false);
  const [mfaMethods, setMfaMethods] = useState<('email' | 'sms')[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First check if user has MFA enabled
      const { data: mfaCheck, error: mfaError } = await supabase.functions.invoke('check-mfa-for-reset', {
        body: { email }
      });

      if (mfaError) {
        throw mfaError;
      }

      if (mfaCheck?.hasMFA) {
        // User has MFA - show MFA verification form
        setMfaMethods(mfaCheck.methods || []);
        setShowMFAForm(true);
      } else {
        // No MFA - proceed with standard reset
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;

        setEmailSent(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromMFA = () => {
    setShowMFAForm(false);
    setMfaMethods([]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <img 
            src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
            alt="BuybidHQ Logo" 
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset Password</h2>
          {!emailSent && !showMFAForm && (
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          )}
          {emailSent && !showMFAForm && (
            <p className="mt-2 text-sm text-gray-600">
              Check your email for the password reset link. You can close this page.
            </p>
          )}
        </div>
        
        {showMFAForm ? (
          <div className="mt-8">
            <MFAPasswordResetForm 
              email={email} 
              mfaMethods={mfaMethods} 
              onBack={handleBackFromMFA}
            />
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="mt-1"
                disabled={emailSent || isLoading}
              />
            </div>
            {!emailSent && (
              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90"
                disabled={isLoading}
              >
                {isLoading ? "Checking..." : "Send Reset Instructions"}
              </Button>
            )}
            <Link 
              to="/signin" 
              className="block text-center text-sm text-[#325AE7] hover:text-[#325AE7]/90"
            >
              ← Back to Sign In
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
