
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PasswordData } from "@/types/password";
import { validatePassword, validatePasswordMatch } from "@/utils/passwordValidation";

export const usePasswordUpdate = () => {
  const { toast } = useToast();
  const [passwordData, setPasswordData] = useState<PasswordData>({
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword;
  const showMismatchError = passwordData.confirmPassword.length > 0 && !passwordsMatch;

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordValidation = validatePassword(passwordData.newPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: "Error",
        description: passwordValidation.error,
        variant: "destructive",
      });
      return;
    }

    const matchValidation = validatePasswordMatch(passwordData.newPassword, passwordData.confirmPassword);
    if (!matchValidation.isValid) {
      toast({
        title: "Error",
        description: matchValidation.error,
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

  return {
    passwordData,
    isUpdatingPassword,
    showMismatchError,
    passwordsMatch,
    handlePasswordChange,
    handlePasswordUpdate,
  };
};
