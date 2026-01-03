
import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  showBack?: boolean;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
}

const StepNavigation = ({ 
  showBack = true, 
  onBack, 
  onNext, 
  nextLabel = "Next" 
}: StepNavigationProps) => {
  return (
    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
      {showBack && onBack && (
        <Button
          onClick={onBack}
          variant="outline"
          className="h-11 px-8 py-2 w-full sm:w-auto sm:min-w-[140px] sm:mr-auto"
        >
          Back
        </Button>
      )}
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
