
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PasswordData {
  newPassword: string;
  confirmPassword: string;
}

export const usePasswordUpdate = () => {
  const { toast } = useToast();
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    newPassword: "",
    confirmPassword: "",
  });

  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword;
  const showMismatchError = passwordData.confirmPassword.length > 0 && !passwordsMatch;

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

    if (!passwordsMatch) {
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

  return {
    passwordData,
    isUpdatingPassword,
    showMismatchError,
    passwordsMatch,
    handlePasswordChange,
    handlePasswordUpdate,
  };
};
