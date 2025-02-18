
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
        >
          Back
        </Button>
      )}
      <div className={!showBack ? "w-full" : ""}>
        <Button 
          onClick={onNext}
          className={`bg-custom-blue hover:bg-custom-blue/90 ${!showBack ? "w-full" : ""}`}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
};

export default StepNavigation;
