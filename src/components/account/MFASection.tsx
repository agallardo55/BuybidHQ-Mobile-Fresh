
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useMFAManagement } from "@/hooks/useMFAManagement";
import { usePhoneFormat } from "@/hooks/signup/usePhoneFormat";
import { Loader2, Mail, Phone, Shield } from "lucide-react";

export const MFASection = () => {
  const {
    emailMFA,
    smsMFA,
    verifyCode,
    setVerifyCode,
    phoneNumber,
    setPhoneNumber,
    currentMethod,
    setEmailMFADialog,
    setSMSMFADialog,
    handleEnrollEmailMFA,
    handleEnrollSMSMFA,
    handleVerifyMFA,
    handleDisableEmailMFA,
    handleDisableSMSMFA,
  } = useMFAManagement();

  const { formatPhoneNumber } = usePhoneFormat();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  const handleEmailMFAToggle = (checked: boolean) => {
    if (checked) {
      handleEnrollEmailMFA();
    } else {
      handleDisableEmailMFA();
    }
  };

  const handleSMSMFAToggle = (checked: boolean) => {
    if (checked) {
      handleEnrollSMSMFA();
    } else {
      handleDisableSMSMFA();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Factor Authentication (MFA)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account by enabling multi-factor authentication.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email MFA Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="email-mfa" className="text-sm font-medium">
                  Email Authentication
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive verification codes via email
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {emailMFA.enrolling && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Switch
                id="email-mfa"
                checked={emailMFA.enabled}
                onCheckedChange={handleEmailMFAToggle}
                disabled={emailMFA.enrolling}
              />
            </div>
          </div>
          {emailMFA.enabled && (
            <div className="ml-7 text-xs text-green-600 dark:text-green-400">
              ✓ Email MFA is active
            </div>
          )}
        </div>

        {/* SMS MFA Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="sms-mfa" className="text-sm font-medium">
                  SMS Authentication
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive verification codes via text message
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {smsMFA.enrolling && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Switch
                id="sms-mfa"
                checked={smsMFA.enabled}
                onCheckedChange={handleSMSMFAToggle}
                disabled={smsMFA.enrolling}
              />
            </div>
          </div>
          
          {!smsMFA.enabled && (
            <div className="ml-7">
              <Label htmlFor="phone-number" className="text-xs text-muted-foreground">
                Phone Number (required for SMS MFA)
              </Label>
              <Input
                id="phone-number"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="mt-1 max-w-xs"
              />
            </div>
          )}
          
          {smsMFA.enabled && (
            <div className="ml-7 text-xs text-green-600 dark:text-green-400">
              ✓ SMS MFA is active
            </div>
          )}
        </div>
      </CardContent>

      {/* Email MFA Verification Dialog */}
      <Dialog open={emailMFA.showDialog} onOpenChange={setEmailMFADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Email MFA</DialogTitle>
            <DialogDescription>
              Enter the verification code sent to your email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-verify-code">Verification Code</Label>
              <Input
                id="email-verify-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={6}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmailMFADialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleVerifyMFA}>
              Verify Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SMS MFA Verification Dialog */}
      <Dialog open={smsMFA.showDialog} onOpenChange={setSMSMFADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify SMS MFA</DialogTitle>
            <DialogDescription>
              Enter the verification code sent to your phone number.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sms-verify-code">Verification Code</Label>
              <Input
                id="sms-verify-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={6}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSMSMFADialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleVerifyMFA}>
              Verify Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
