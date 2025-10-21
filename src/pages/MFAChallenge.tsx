import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Phone, Shield, ArrowLeft } from "lucide-react";
import { useMFAChallenge } from "@/hooks/useMFAChallenge";

import { useAuthWithMFA } from "@/hooks/useAuthWithMFA";

export default function MFAChallenge() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const urlCodeSent = searchParams.get('codeSent') === 'true';
  
  const { completeMFALogin } = useAuthWithMFA();

  const {
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
  } = useMFAChallenge(email, urlCodeSent);

  useEffect(() => {
    if (!email) {
      navigate('/signin');
      return;
    }
  }, [email, navigate]);

  const handleSendCode = async () => {
    const success = await sendMFAChallenge();
    if (!success && error?.includes('invalid') || error?.includes('not found')) {
      // If user/session is invalid, redirect back to login
      navigate('/signin');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    const success = await verifyMFAChallenge(verificationCode);
    if (success) {
      // Complete the MFA login process
      const loginSuccess = await completeMFALogin(email!, redirectTo);
      if (loginSuccess) {
        navigate(redirectTo);
      }
    }
  };

  const handleGoBack = () => {
    navigate('/signin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading MFA options...</span>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-destructive mb-4" />
            <CardTitle>MFA Not Available</CardTitle>
            <CardDescription>
              SMS MFA is not available for this account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoBack} className="w-full">
              Return to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
          <CardTitle>Multi-Factor Authentication</CardTitle>
          <CardDescription>
            Additional security verification required for {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Send Code Button */}
          {!codeSent && (
            <Button 
              onClick={handleSendCode} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Send SMS Code
                </>
              )}
            </Button>
          )}

          {/* Code Input */}
          {codeSent && (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                {maskedPhone ? `Code sent to ${maskedPhone}` : 'We sent a verification code to your phone number.'}
              </div>
              
              {attemptCount > 0 && (
                <div className="text-center text-sm text-amber-600">
                  Attempts: {attemptCount}/5
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6} 
                    value={verificationCode}
                    onChange={(value) => setVerificationCode(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={handleVerifyCode} 
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  onClick={resendCode}
                  disabled={isLoading || resendCooldown > 0}
                  size="sm"
                >
                  {resendCooldown > 0 ? `Resend in ${Math.ceil(resendCooldown / 1000)}s` : 'Resend Code'}
                </Button>
              </div>
            </div>
          )}

          {/* Back to Login */}
          <div className="flex justify-center pt-4 border-t">
            <Button 
              variant="ghost" 
              onClick={handleGoBack}
              className="text-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}