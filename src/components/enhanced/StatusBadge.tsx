/**
 * Status Badge Component
 * 
 * Semantic status badge using design system tokens for consistent status display.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        pending: "bg-status-pending/10 text-status-pending border border-status-pending/20",
        active: "bg-status-active/10 text-status-active border border-status-active/20",
        completed: "bg-status-completed/10 text-status-completed border border-status-completed/20",
        cancelled: "bg-status-cancelled/10 text-status-cancelled border border-status-cancelled/20",
        // Generic variants
        success: "bg-success/10 text-success border border-success/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        info: "bg-info/10 text-info border border-info/20",
        error: "bg-error/10 text-error border border-error/20",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "md",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, size, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(statusBadgeVariants({ status, size }), className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

// Helper function to get appropriate status variant from string
export const getStatusVariant = (status: string): VariantProps<typeof statusBadgeVariants>['status'] => {
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case 'pending':
      return 'pending';
    case 'active':
    case 'in_progress':
    case 'processing':
      return 'active';
    case 'completed':
    case 'done':
    case 'finished':
      return 'completed';
    case 'cancelled':
    case 'canceled':
    case 'rejected':
    case 'declined':
      return 'cancelled';
    case 'success':
    case 'approved':
    case 'accepted':
      return 'success';
    case 'warning':
    case 'caution':
      return 'warning';
    case 'info':
    case 'information':
      return 'info';
    case 'error':
    case 'failed':
    case 'failure':
      return 'error';
    default:
      return 'pending';
  }
};

export { StatusBadge, statusBadgeVariants };