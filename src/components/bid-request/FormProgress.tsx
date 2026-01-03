import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormProgressProps {
  currentStep: string;
  progressMap: {
    [key: string]: number;
  };
}

const steps = [
  { id: 'appearance', label: 'Appearance', description: 'Colors & images' },
  { id: 'condition', label: 'Condition', description: 'Assessment' },
  { id: 'book-values', label: 'Valuation', description: 'Pricing' },
  { id: 'buyers', label: 'Buyers', description: 'Selection' }
];

const FormProgress = ({ currentStep }: FormProgressProps) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
              isComplete ? "bg-custom-blue border-custom-blue text-white" :
              isActive ? "border-custom-blue text-custom-blue bg-custom-blue/10" :
              "border-slate-300 text-slate-400 bg-white"
            )}>
              {isComplete ? <Check className="h-5 w-5" /> : index + 1}
            </div>

            {/* Step Label */}
            <div className="ml-3 flex-1">
              <p className={cn(
                "text-[11px] font-bold uppercase tracking-widest",
                isActive ? "text-custom-blue" : "text-slate-600"
              )}>
                {step.label}
              </p>
              <p className="text-[10px] text-slate-500">
                {step.description}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={cn(
                "h-0.5 flex-1 mx-4",
                isComplete ? "bg-custom-blue" : "bg-slate-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FormProgress;
