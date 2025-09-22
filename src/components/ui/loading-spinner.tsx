/**
 * Loading Spinner Component
 * 
 * Reusable loading spinner with consistent styling using semantic tokens.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "animate-spin rounded-full border-solid border-r-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        default: "h-8 w-8 border-2",
        lg: "h-12 w-12 border-4",
        xl: "h-16 w-16 border-4",
      },
      variant: {
        default: "border-primary",
        secondary: "border-secondary-foreground",
        muted: "border-muted-foreground",
        accent: "border-accent",
        white: "border-white",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
  showLabel?: boolean;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, label = "Loading...", showLabel = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(spinnerVariants({ size, variant }))}
            role="status"
            aria-label={label}
          />
          {showLabel && (
            <span className="text-sm text-muted-foreground">{label}</span>
          )}
        </div>
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner, spinnerVariants };