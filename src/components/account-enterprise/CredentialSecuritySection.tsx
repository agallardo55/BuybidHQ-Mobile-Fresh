import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserData } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/notificationToast";
import { Check, X } from "lucide-react";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import { validatePassword, validatePasswordMatch } from "@/utils/passwordValidation";

interface CredentialSecuritySectionProps {
  user: UserData | null | undefined;
}

export const CredentialSecuritySection = ({ user }: CredentialSecuritySectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { isValid: isPasswordValid } = usePasswordStrength(formData.newPassword);
  const passwordsMatch = formData.newPassword === formData.confirmPassword;
  const showMismatchError = formData.confirmPassword.length > 0 && !passwordsMatch;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate password
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.error || "Invalid password");
        setIsSubmitting(false);
        return;
      }

      // Validate password match
      const matchValidation = validatePasswordMatch(formData.newPassword, formData.confirmPassword);
      if (!matchValidation.isValid) {
        toast.error(matchValidation.error || "Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Credential modifications committed successfully");
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation requirements
  const meetsMinLength = formData.newPassword.length >= 8;
  const passwordsMatchReq = formData.newPassword.length > 0 && formData.confirmPassword.length > 0 && passwordsMatch;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CREDENTIAL SECURITY</h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 mt-2">
          PASSWORD MANAGEMENT PROTOCOL
        </p>
      </div>

      <Card className="border-slate-200 shadow-none">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Password Fields */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                NEW PASSWORD
              </Label>
              <Input
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleChange("newPassword", e.target.value)}
                className="bg-white border-slate-200 h-10"
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                CONFIRM PASSWORD
              </Label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="bg-white border-slate-200 h-10"
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
              {showMismatchError && (
                <p className="text-[10px] text-red-600 uppercase tracking-wide">
                  PASSWORDS DO NOT MATCH
                </p>
              )}
            </div>
          </div>

          {/* Validation Requirements */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 mb-4">
              VALIDATION REQUIREMENTS
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {meetsMinLength ? (
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-slate-400 flex-shrink-0" />
                )}
                <span className={`text-xs ${meetsMinLength ? 'text-slate-900' : 'text-slate-500'}`}>
                  Minimum 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                {passwordsMatchReq ? (
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-slate-400 flex-shrink-0" />
                )}
                <span className={`text-xs ${passwordsMatchReq ? 'text-slate-900' : 'text-slate-500'}`}>
                  Passwords match
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <Button
              type="submit"
              disabled={isSubmitting || !isPasswordValid || showMismatchError}
              className="bg-brand hover:bg-brand/90 text-white h-10 px-6 text-xs font-medium uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "PROCESSING..." : "UPDATE"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
