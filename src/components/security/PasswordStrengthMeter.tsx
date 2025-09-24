import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    label: "Contains uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: "Contains lowercase letter", 
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: "Contains number",
    test: (password) => /\d/.test(password),
  },
  {
    label: "Contains special character",
    test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
];

export const PasswordStrengthMeter = ({ password, showRequirements = false }: PasswordStrengthMeterProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "bg-muted" };
    
    const passed = passwordRequirements.filter(req => req.test(password)).length;
    
    if (passed < 2) return { score: 20, label: "Very Weak", color: "bg-destructive" };
    if (passed < 3) return { score: 40, label: "Weak", color: "bg-orange-500" };
    if (passed < 4) return { score: 60, label: "Fair", color: "bg-yellow-500" };
    if (passed < 5) return { score: 80, label: "Good", color: "bg-blue-500" };
    return { score: 100, label: "Strong", color: "bg-green-500" };
  }, [password]);

  const requirementsMet = useMemo(() => {
    return passwordRequirements.map(req => ({
      ...req,
      met: req.test(password),
    }));
  }, [password]);

  if (!password && !showRequirements) return null;

  return (
    <div className="space-y-3">
      {password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Password strength</span>
            <span className={cn(
              "font-medium",
              strength.score >= 80 ? "text-green-600 dark:text-green-400" :
              strength.score >= 60 ? "text-blue-600 dark:text-blue-400" :
              strength.score >= 40 ? "text-yellow-600 dark:text-yellow-400" :
              "text-destructive"
            )}>
              {strength.label}
            </span>
          </div>
          <Progress value={strength.score} className="h-2" />
        </div>
      )}
      
      {showRequirements && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Password requirements:</p>
          <div className="space-y-1">
            {requirementsMet.map((requirement, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {requirement.met ? (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={cn(
                  requirement.met 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-muted-foreground"
                )}>
                  {requirement.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};