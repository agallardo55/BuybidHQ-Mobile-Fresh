
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePasswordUpdate } from "@/hooks/usePasswordUpdate";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import { useSecurityEvents } from "@/hooks/useSecurityEvents";
import { PasswordStrengthMeter } from "@/components/security/PasswordStrengthMeter";

export const PasswordUpdateForm = () => {
  const {
    passwordData,
    isUpdatingPassword,
    showMismatchError,
    handlePasswordChange,
    handlePasswordUpdate,
  } = usePasswordUpdate();
  
  const { isValid: isPasswordValid, errors } = usePasswordStrength(passwordData.newPassword);
  const { logSecurityEvent } = useSecurityEvents();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid || showMismatchError) {
      return;
    }

    const success = await handlePasswordUpdate(e);
    
    if (success) {
      // Log security event
      logSecurityEvent.mutate({
        eventType: "password_change",
        details: { method: "manual_update" }
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                New Password
              </label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                required
                autoComplete="new-password"
              />
              <PasswordStrengthMeter password={passwordData.newPassword} showRequirements />
              
              {errors.length > 0 && (
                <div className="space-y-1 mt-2">
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                required
                className={cn(
                  showMismatchError && "border-destructive"
                )}
                autoComplete="new-password"
              />
              {showMismatchError && (
                <p className="mt-1 text-sm text-destructive">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="default"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isUpdatingPassword || showMismatchError || !isPasswordValid}
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
      </CardContent>
    </Card>
  );
};

