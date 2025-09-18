
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Mail, MessageSquare } from "lucide-react";
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

  const [selectedMethod, setSelectedMethod] = useState("email");

  return (
    <div className="pt-6 border-t">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Multi-Factor Authentication (MFA)</h3>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security by enabling multi-factor authentication.
          You'll receive a verification code when signing in.
        </p>
        
        <div className="space-y-4">
          <Label className="text-base">Authentication Method</Label>
          <RadioGroup 
            value={selectedMethod} 
            onValueChange={setSelectedMethod}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
              <RadioGroupItem value="email" id="email" />
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <Label htmlFor="email" className="font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">Receive codes via email</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
              <RadioGroupItem value="sms" id="sms" />
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <Label htmlFor="sms" className="font-medium">SMS</Label>
                <p className="text-sm text-muted-foreground">Receive codes via text message</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable {selectedMethod === "email" ? "Email" : "SMS"} MFA</Label>
            <div className="text-sm text-muted-foreground">
              {isMFAEnabled ? `${selectedMethod === "email" ? "Email" : "SMS"} MFA is enabled` : `${selectedMethod === "email" ? "Email" : "SMS"} MFA is disabled`}
              {isEnrollingMFA && (
                <div className="flex items-center mt-1">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Setting up {selectedMethod === "email" ? "Email" : "SMS"} MFA...
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
            <DialogTitle>Verify {selectedMethod === "email" ? "Email" : "SMS"} Authentication</DialogTitle>
            <DialogDescription>
              Enter the verification code sent to your {selectedMethod === "email" ? "email address" : "phone number"}.
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
              Verify and Enable {selectedMethod === "email" ? "Email" : "SMS"} MFA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
