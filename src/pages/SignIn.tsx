
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/notificationToast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Map technical auth errors to user-friendly messages
const getAuthErrorMessage = (error: { message: string; status?: number }): string => {
  const msg = error.message.toLowerCase();

  if (msg.includes("invalid login credentials") || msg.includes("invalid password")) {
    return "Invalid email or password. Please try again.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }
  if (msg.includes("user not found") || msg.includes("no user found")) {
    return "No account found with this email address.";
  }
  if (msg.includes("too many requests") || msg.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Unable to connect. Please check your internet connection.";
  }
  // Default friendly message
  return "Unable to sign in. Please try again.";
};

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setIsAuthenticating } = useAuth();

  // Reset authentication flag when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      setIsAuthenticating(false);
    };
  }, [setIsAuthenticating]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim email and password to prevent whitespace issues
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setIsAuthenticating(true); // Set flag BEFORE calling signInWithPassword

    try {
      // Log request details (without password) for debugging
      console.log('SignIn: Attempting sign in with email:', trimmedEmail);
      
      // Sign in with password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (signInError) {
        setIsAuthenticating(false);

        // Detailed error logging to capture full Supabase error response
        console.error('Auth error full details:', {
          message: signInError.message,
          status: signInError.status,
          code: (signInError as any).code,
          cause: (signInError as any).cause,
          error: signInError,
        });

        toast.error(getAuthErrorMessage(signInError));
        return;
      }

      if (!signInData.user) {
        setIsAuthenticating(false);
        toast.error('Authentication failed');
        return;
      }

      // Check if user needs MFA verification
      const { data: mfaNeeded, error: mfaError } = await supabase.rpc('needs_daily_mfa');

      if (mfaError) {
        console.error('Error checking MFA status:', mfaError);
        // Fail open - navigate to dashboard
        setIsAuthenticating(false);
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
        return;
      }

      setIsAuthenticating(false);

      if (mfaNeeded === true) {
        // User needs MFA - redirect to challenge
        const from = (location.state as any)?.from?.pathname || '/dashboard';

        // Store in sessionStorage so it persists across refreshes/redirects
        sessionStorage.setItem('mfa_is_initial_signin', 'true');

        navigate('/auth/mfa-challenge', {
          state: {
            from: { pathname: from },
            isInitialSignIn: true  // Auto-send code on initial sign-in
          },
          replace: true
        });
      } else {
        // User doesn't need MFA - go to original destination
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
      
    } catch (error: any) {
      console.error("Sign in error (catch block):", {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        cause: error?.cause,
        error: error,
      });
      setIsAuthenticating(false);
      toast.error(getAuthErrorMessage(error || { message: "Unknown error" }));
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
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#325AE7] hover:text-[#325AE7]/90"
                >
                  Forgot your password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="mt-1"
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
              >
                Remember me for 7 days
              </label>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <Link 
            to="/" 
            className="mt-4 block text-center text-sm text-[#325AE7] hover:text-[#325AE7]/90"
          >
            ← Back Home
          </Link>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
