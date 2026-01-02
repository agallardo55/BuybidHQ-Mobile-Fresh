import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percentage: number;
  className?: string;
}

export const ProgressBar = ({ percentage, className }: ProgressBarProps) => {
  return (
    <div className={cn("w-full bg-slate-100 rounded-full h-1.5 overflow-hidden", className)}>
      <div
        className="h-full bg-custom-blue rounded-full transition-all duration-500 ease-out shadow-sm"
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
};
