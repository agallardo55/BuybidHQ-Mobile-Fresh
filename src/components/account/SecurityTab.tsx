import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [isEnrollingMFA, setIsEnrollingMFA] = useState(false);
  const [showMFADialog, setShowMFADialog] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
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
      
      setIsMFAEnabled(factors.email && factors.email.length > 0);
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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("No user email found");
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (error) throw error;

      setShowMFADialog(true);
      toast({
        title: "Code Sent",
        description: "Please check your email for the verification code.",
      });
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("No user email found");
      }

      const { error } = await supabase.auth.verifyOtp({
        email: user.email,
        token: verifyCode,
        type: 'email'
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email-based MFA has been enabled successfully",
      });
      
      setShowMFADialog(false);
      setVerifyCode("");
      checkMFAStatus();
    } catch (error: any) {
      console.error('Error verifying MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      });
    }
  };

  const handleDisableMFA = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("No user email found");
      }

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: 'email'
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
              Verify and Enable Email 2FA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
