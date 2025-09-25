
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMFAManagement } from "@/hooks/useMFAManagement";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Loader2, Phone, Shield } from "lucide-react";

export const MFASection = () => {
  const { currentUser } = useCurrentUser();
  const {
    smsMFA,
    handleEnableSMSMFA,
    handleDisableSMSMFA,
  } = useMFAManagement();

  const userMobileNumber = currentUser?.mobile_number;

  const handleSMSMFAToggle = (checked: boolean) => {
    if (checked) {
      if (!userMobileNumber) {
        // Show error message if no mobile number
        return;
      }
      handleEnableSMSMFA();
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
                disabled={smsMFA.enrolling || !userMobileNumber}
              />
            </div>
          </div>
          
          {!smsMFA.enabled && !userMobileNumber && (
            <div className="ml-7 text-xs text-orange-600 dark:text-orange-400">
              ⚠️ Please add a mobile number in your Personal Info tab to enable SMS MFA
            </div>
          )}
          
          {smsMFA.enabled && (
            <div className="ml-7 text-xs text-green-600 dark:text-green-400">
              ✓ SMS MFA is active
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
