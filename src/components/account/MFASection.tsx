
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useMFAManagement } from "@/hooks/useMFAManagement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const MFASection = () => {
  const {
    isMFAEnabled,
    isEnrollingMFA,
    showMFADialog,
    verifyCode,
    setVerifyCode,
    setShowMFADialog,
    handleEnrollMFA,
    handleVerifyMFA,
    handleDisableMFA,
  } = useMFAManagement();

  return (
    <div className="pt-6 border-t">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Email-Based Two-Factor Authentication (2FA)</h3>
      {isMFAEnabled ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Email-based two-factor authentication is currently enabled for your account.
          </p>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDisableMFA}
            className="w-full"
          >
            Disable Email 2FA
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Add an extra layer of security by enabling email-based two-factor authentication.
            You'll receive a verification code by email when signing in.
          </p>
          <Button
            type="button"
            onClick={handleEnrollMFA}
            className="w-full bg-accent hover:bg-accent/90"
            disabled={isEnrollingMFA}
          >
            {isEnrollingMFA ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up Email 2FA...
              </>
            ) : (
              "Enable Email 2FA"
            )}
          </Button>
        </div>
      )}

      <Dialog open={showMFADialog} onOpenChange={setShowMFADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Email Authentication</DialogTitle>
            <DialogDescription>
              Enter the verification code sent to your email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verifyCode">Verification code:</Label>
              <Input
                id="verifyCode"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Enter verification code"
                maxLength={6}
              />
            </div>
            <Button
              type="button"
              onClick={handleVerifyMFA}
              className="w-full bg-accent hover:bg-accent/90"
            >
              Verify and Enable Email 2FA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
