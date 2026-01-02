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
    // Don't show if already dismissed
    const isDismissed = localStorage.getItem(dismissKey) === "true";
    if (isDismissed || isLoading || !currentUser) {
      return;
    }

    // Calculate completion
    const profileCompletion = calculateProfileCompletion(currentUser);
    setCompletion(profileCompletion);

    // Don't show if profile is 100% complete
    if (profileCompletion.percentage >= 100) {
      return;
    }

    // Generate motivational message
    const message = generateMotivationalMessage(
      currentUser.full_name,
      profileCompletion.percentage,
      profileCompletion.missingFields.length
    );
    setMotivationalMessage(message);

    // Show toast after delay
    const showTimeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(showTimeout);
  }, [currentUser, isLoading, delay, dismissKey]);

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    localStorage.setItem(dismissKey, "true");
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
        "fixed bottom-6 right-6 z-50 max-w-md",
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
