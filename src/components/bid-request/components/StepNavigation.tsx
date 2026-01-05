
import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  showBack?: boolean;
  showCancel?: boolean;
  onBack?: () => void;
  onCancel?: () => void;
  onNext: () => void;
  nextLabel?: string;
}

const StepNavigation = ({
  showBack = true,
  showCancel = false,
  onBack,
  onCancel,
  onNext,
  nextLabel = "Next"
}: StepNavigationProps) => {
  return (
    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
      <div className="flex gap-3">
        {showBack && onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="h-11 px-8 py-2 w-full sm:w-auto sm:min-w-[140px]"
          >
            Back
          </Button>
        )}
        {showCancel && onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            className="h-11 px-8 py-2 w-full sm:w-auto sm:min-w-[140px]"
          >
            Cancel
          </Button>
        )}
      </div>
      <Button
        onClick={onNext}
        variant="custom-blue"
        className="h-11 px-8 py-2 w-full sm:w-auto sm:min-w-[140px]"
      >
        {nextLabel}
      </Button>
    </div>
  );
};

export default StepNavigation;
