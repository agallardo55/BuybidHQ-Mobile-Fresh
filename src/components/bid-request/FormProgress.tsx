
import { Progress } from "@/components/ui/progress";

interface FormProgressProps {
  currentStep: string;
  progressMap: {
    [key: string]: number;
  };
}

const FormProgress = ({ currentStep, progressMap }: FormProgressProps) => {
  return (
    <div className="mb-6">
      <Progress value={progressMap[currentStep]} className="h-2 bg-gray-200 [&>[role=progressbar]]:bg-custom-blue" />
      <div className="flex justify-between text-sm text-gray-500 mt-1">
        <span>Step {Object.keys(progressMap).indexOf(currentStep) + 1} of 4</span>
        <span>{progressMap[currentStep]}% Complete</span>
      </div>
    </div>
  );
};

export default FormProgress;
