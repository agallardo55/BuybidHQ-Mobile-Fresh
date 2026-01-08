import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { calculateProfileCompletion, generateMotivationalMessage } from "@/services/profileService";
import { ProgressBar } from "./ProgressBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingToastProps {
  className?: string;
  delay?: number; // Delay before showing (in ms)
  dismissKey?: string; // LocalStorage key for dismissal tracking
}

export const OnboardingToast = ({
  className,
  delay = 1500,
  dismissKey = "onboarding-toast-dismissed"
}: OnboardingToastProps) => {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useCurrentUser();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [completion, setCompletion] = useState({ percentage: 0, missingFields: [] as string[] });

  useEffect(() => {
    // Clear any old localStorage dismissal flag (migration from old behavior)
    if (localStorage.getItem(dismissKey)) {
      localStorage.removeItem(dismissKey);
    }

    // Don't show if already dismissed in this session (uses sessionStorage, not localStorage)
    // This means it will show again on next login if profile still isn't complete
    const isDismissed = sessionStorage.getItem(dismissKey) === "true";

    // DEBUG: Log all conditions
    console.log('🎯 OnboardingToast Debug:', {
      isDismissed,
      isLoading,
      hasCurrentUser: !!currentUser,
      dismissKey,
      sessionStorageValue: sessionStorage.getItem(dismissKey),
      currentUser: currentUser ? {
        email: currentUser.email,
        role: currentUser.role,
        app_role: currentUser.app_role,
        full_name: currentUser.full_name,
        mobile_number: currentUser.mobile_number,
        dealer_name: currentUser.dealer_name,
        license_number: currentUser.license_number,
        address: currentUser.address,
        city: currentUser.city,
        state: currentUser.state,
        zip_code: currentUser.zip_code
      } : null
    });

    if (isDismissed || isLoading || !currentUser) {
      console.log('🎯 OnboardingToast: Early return -', {
        reason: isDismissed ? 'dismissed' : isLoading ? 'loading' : 'no user',
        isDismissed,
        isLoading,
        hasUser: !!currentUser
      });
      return;
    }

    // Only hide for super admin users (who manage the application globally)
    const isSuperAdmin = currentUser.role === 'super_admin' || currentUser.app_role === 'super_admin';

    if (isSuperAdmin) {
      console.log('🎯 OnboardingToast: User is super admin, hiding toast');
      return;
    }

    // Calculate completion
    const profileCompletion = calculateProfileCompletion(currentUser);
    setCompletion(profileCompletion);

    console.log('🎯 OnboardingToast: Profile completion:', {
      percentage: profileCompletion.percentage,
      missingFields: profileCompletion.missingFields,
      completedFields: profileCompletion.completedFields
    });

    // Don't show if profile is 100% complete
    if (profileCompletion.percentage >= 100) {
      console.log('🎯 OnboardingToast: Profile 100% complete, hiding toast');
      return;
    }

    // Generate motivational message
    const message = generateMotivationalMessage(
      currentUser.full_name,
      profileCompletion.percentage,
      profileCompletion.missingFields.length
    );
    setMotivationalMessage(message);

    console.log('🎯 OnboardingToast: Will show toast in', delay, 'ms');

    // Show toast after delay
    const showTimeout = setTimeout(() => {
      console.log('🎯 OnboardingToast: Showing toast now!');
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(showTimeout);
  }, [currentUser, isLoading, delay, dismissKey]);

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    // Use sessionStorage so toast shows again on next login if profile still incomplete
    sessionStorage.setItem(dismissKey, "true");
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleCompleteDetails = () => {
    handleDismiss();
    navigate("/account?tab=personal");
  };

  if (!isVisible || completion.percentage >= 100) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[9998] max-w-md",
        "animate-in slide-in-from-right-5 fade-in duration-500",
        isAnimatingOut && "animate-out slide-out-to-right-5 fade-out duration-300",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with dismiss button */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-custom-blue/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-custom-blue" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Complete Your Profile
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {completion.percentage}% complete
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1 -mt-1 -mr-1 rounded-lg hover:bg-slate-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5">
          <ProgressBar percentage={completion.percentage} />
        </div>

        {/* Message */}
        <div className="px-5 py-4">
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            {motivationalMessage || "Complete your profile to unlock all features."}
          </p>
        </div>

        {/* Missing fields hint */}
        {completion.missingFields.length > 0 && (
          <div className="px-5 pb-3">
            <p className="text-xs text-slate-500">
              Missing: {completion.missingFields.slice(0, 3).join(", ")}
              {completion.missingFields.length > 3 && ` +${completion.missingFields.length - 3} more`}
            </p>
          </div>
        )}

        {/* Action button */}
        <div className="px-5 pb-5">
          <Button
            onClick={handleCompleteDetails}
            className="w-full bg-custom-blue hover:bg-custom-blue/90 text-white font-medium text-sm py-2.5 rounded-lg transition-colors shadow-sm"
          >
            Complete Details
          </Button>
        </div>
      </div>
    </div>
  );
};
