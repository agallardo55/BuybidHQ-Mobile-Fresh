
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
      <Button 
        onClick={onNext}
        className={`bg-custom-blue hover:bg-custom-blue/90 text-white ${!showBack ? "w-full" : ""}`}
      >
        {nextLabel}
      </Button>
    </div>
  );
};

export default StepNavigation;
