import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { Mail, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export const EmailVerificationPrompt = () => {
  const {
    isEmailVerified,
    isResendingVerification,
    canResend,
    resendCooldown,
    resendVerificationEmail,
  } = useEmailVerification();

  if (isEmailVerified) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-green-700 dark:text-green-300">
          Your email address has been verified.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-orange-900 dark:text-orange-100">
              Email Verification Required
            </h3>
            <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
              Please verify your email address to access all features and ensure account security.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={resendVerificationEmail}
                disabled={isResendingVerification || !canResend}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/40"
              >
                <Mail className="h-4 w-4 mr-2" />
                {isResendingVerification ? "Sending..." : "Resend Verification Email"}
              </Button>
              {!canResend && resendCooldown > 0 && (
                <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                  <Clock className="h-4 w-4 mr-1" />
                  Resend available in {resendCooldown}s
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};