
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
    <div className="mt-6 flex justify-end">
      {showBack && onBack && (
        <Button 
          onClick={onBack}
          variant="outline"
          className="mr-auto"
        >
          Back
        </Button>
      )}
      <Button 
        onClick={onNext}
        variant="custom-blue"
      >
        {nextLabel}
      </Button>
    </div>
  );
};

export default StepNavigation;
