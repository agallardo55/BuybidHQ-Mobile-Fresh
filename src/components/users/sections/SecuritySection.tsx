
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SecuritySectionProps {
  userEmail: string;
}

const SecuritySection = ({ userEmail }: SecuritySectionProps) => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async () => {
    setIsSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Please check your email for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Password Reset</h3>
        <p className="text-sm text-gray-500 mt-1">
          Send a password reset email to the user's email address.
        </p>
      </div>
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={handlePasswordReset}
          disabled={isSending}
          className="w-full sm:w-auto"
        >
          {isSending ? "Sending..." : "Send Password Reset Email"}
        </Button>
      </div>
    </div>
  );
};

export default SecuritySection;
