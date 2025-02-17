
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export const SecurityTab = () => {
  const { toast } = useToast();
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [mfaFactors, setMFAFactors] = useState<any[]>([]);
  const [isEnrollingMFA, setIsEnrollingMFA] = useState(false);
  const [showMFADialog, setShowMFADialog] = useState(false);
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: factors, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      setMFAFactors(factors.totp);
      setIsMFAEnabled(factors.totp.some(factor => factor.status === 'verified'));
    } catch (error: any) {
      console.error('Error checking MFA status:', error);
      toast({
        title: "Error",
        description: "Failed to check MFA status",
        variant: "destructive",
      });
    }
  };

  const handleEnrollMFA = async () => {
    try {
      setIsEnrollingMFA(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });

      if (error) throw error;

      if (data) {
        setQRCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setShowMFADialog(true);
      }
    } catch (error: any) {
      console.error('Error enrolling MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enroll MFA",
        variant: "destructive",
      });
    } finally {
      setIsEnrollingMFA(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!verifyCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.mfa.challenge({
        factorId: mfaFactors[0].id
      });
      
      if (error) throw error;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactors[0].id,
        code: verifyCode,
      });

      if (verifyError) throw verifyError;

      toast({
        title: "Success",
        description: "MFA has been enabled successfully",
      });
      
      setShowMFADialog(false);
      setVerifyCode("");
      checkMFAStatus();
    } catch (error: any) {
      console.error('Error verifying MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify MFA code",
        variant: "destructive",
      });
    }
  };

  const handleDisableMFA = async () => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: mfaFactors[0].id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "MFA has been disabled successfully",
      });
      
      checkMFAStatus();
    } catch (error: any) {
      console.error('Error disabling MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to disable MFA",
        variant: "destructive",
      });
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validatePassword(passwordData.newPassword);
    if (passwordError) {
      toast({
        title: "Error",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your password has been successfully updated.",
      });

      setPasswordData({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              minLength={6}
            />
            <p className="mt-1 text-sm text-gray-500">
              Password must be at least 6 characters long
            </p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              minLength={6}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={isUpdatingPassword}
        >
          {isUpdatingPassword ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>

      <div className="pt-6 border-t">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication (2FA)</h3>
        {isMFAEnabled ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Two-factor authentication is currently enabled for your account.
            </p>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDisableMFA}
              className="w-full"
            >
              Disable 2FA
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Add an extra layer of security to your account by enabling two-factor authentication.
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
                  Setting up 2FA...
                </>
              ) : (
                "Enable 2FA"
              )}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showMFADialog} onOpenChange={setShowMFADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app and enter the verification code below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <QRCodeSVG value={qrCode} size={200} />
              </div>
            )}
            {secret && (
              <div className="space-y-2">
                <Label htmlFor="secret">Manual entry code:</Label>
                <Input
                  id="secret"
                  value={secret}
                  readOnly
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <p className="text-sm text-gray-500">
                  If you can't scan the QR code, enter this code manually in your authenticator app.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="verifyCode">Verification code:</Label>
              <Input
                id="verifyCode"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            <Button
              type="button"
              onClick={handleVerifyMFA}
              className="w-full bg-accent hover:bg-accent/90"
            >
              Verify and Enable 2FA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
