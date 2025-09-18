
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
      <h3 className="text-lg font-medium text-gray-900 mb-4">Email-Based Multi-Factor Authentication (MFA)</h3>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security by enabling email-based multi-factor authentication.
          You'll receive a verification code by email when signing in.
        </p>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Email MFA</Label>
            <div className="text-sm text-muted-foreground">
              {isMFAEnabled ? "Email MFA is enabled" : "Email MFA is disabled"}
              {isEnrollingMFA && (
                <div className="flex items-center mt-1">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Setting up Email MFA...
                </div>
              )}
            </div>
          </div>
          <Switch
            checked={isMFAEnabled}
            disabled={isEnrollingMFA}
            onCheckedChange={(checked) => {
              if (checked) {
                handleEnrollMFA();
              } else {
                handleDisableMFA();
              }
            }}
          />
        </div>
      </div>

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
              Verify and Enable Email MFA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
