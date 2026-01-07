import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const passwordsMatch = password === confirmPassword;
  const showMismatchError = confirmPassword.length > 0 && !passwordsMatch;

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event to detect recovery flow
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery detected');
        setIsRecoveryFlow(true);
      }
    });

    // Check for existing session and recovery tokens
    const checkRecovery = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const hash = window.location.hash;
      
      const hasRecoveryToken = hash.includes('type=recovery') || hash.includes('access_token');
      
      if (hasRecoveryToken || session) {
        setIsRecoveryFlow(true);
      } else {
        // No recovery flow detected, redirect to signin
        navigate('/signin', { replace: true });
      }
    };
    
    checkRecovery();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("handleSubmit called");

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Error",
        description: passwordError,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log("Calling supabase.auth.updateUser");
      const startTime = Date.now();
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });
      const endTime = Date.now();
      console.log(`supabase.auth.updateUser took ${endTime - startTime}ms`);

      if (error) {
        console.error("Supabase updateUser error:", error);
        throw error;
      }

      // Wait for session to be confirmed before navigating
      // This prevents race condition with ProtectedRoute auth check
      console.log("Verifying session after password update");

      // Retry session check with timeout (max 3 attempts over 1.5 seconds)
      let session = null;
      let sessionError = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data: { session: currentSession }, error: currentError } = await supabase.auth.getSession();

        if (currentSession) {
          session = currentSession;
          break;
        }

        sessionError = currentError;

        if (attempt < 3) {
          console.log(`Session not ready, retrying (attempt ${attempt}/3)...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (sessionError) {
        console.error("Session verification error:", sessionError);
        throw sessionError;
      }

      if (!session) {
        console.error("No session found after password update");
        throw new Error('Session not established after password update. Please sign in again.');
      }

      console.log("Session confirmed, user:", session.user.id);

      toast({
        title: "Success",
        description: "Your password has been successfully updated. Welcome back!",
      });

      // Session is confirmed, safe to navigate to dashboard
      console.log("Navigating to /dashboard");
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
      
      // If there's a session error, redirect to forgot password
      if (error.message?.includes('session') || error.message?.includes('token')) {
        console.log("Redirecting to /forgot-password due to session/token error");
        navigate('/forgot-password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <img 
            src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
            alt="BuybidHQ Logo" 
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isRecoveryFlow ? "Reset Your Password" : "Set New Password"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your new password below.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="mt-1"
                minLength={8}
                autoComplete="new-password"
              />
              <p className="mt-1 text-sm text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className={cn(
                  "mt-1",
                  showMismatchError && "border-red-500 focus:ring-red-500 focus-visible:ring-red-500"
                )}
                minLength={8}
                autoComplete="new-password"
              />
              {showMismatchError && (
                <p className="mt-1 text-sm text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90"
            disabled={isLoading || showMismatchError}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
