
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
          className="h-10 px-3 py-2 w-full sm:w-auto sm:mr-auto"
        >
          Back
        </Button>
      )}
      <Button 
        onClick={onNext}
        variant="custom-blue"
        className="h-10 px-3 py-2 w-full sm:w-auto"
      >
        {nextLabel}
      </Button>
    </div>
  );
};

export default StepNavigation;
