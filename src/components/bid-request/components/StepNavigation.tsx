
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
    <div className="mt-6 flex justify-between">
      {showBack && onBack && (
        <Button 
          onClick={onBack}
          variant="outline"
          size="lg"
        >
          Back
        </Button>
      )}
      <div className={!showBack ? "w-full" : ""}>
        <Button 
          onClick={onNext}
          variant="custom-blue"
          size="lg"
          className={!showBack ? "w-full" : ""}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
};

export default StepNavigation;
