
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PlanSelectionFormProps {
  onSelect: (plan: 'beta-access' | 'individual') => void;
  onBack: () => void;
}

const PlanSelectionForm = ({ onSelect, onBack }: PlanSelectionFormProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 cursor-pointer hover:border-accent" onClick={() => onSelect('beta-access')}>
          <h3 className="text-lg font-semibold">Basic Trial</h3>
          <div className="text-2xl font-bold">Free</div>
          <p className="text-sm text-gray-600">14-day trial access</p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Basic bidding features</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Connect with 5 dealers</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 space-y-4 cursor-pointer hover:border-accent relative" onClick={() => onSelect('individual')}>
          <div className="absolute -top-3 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm">
            Popular
          </div>
          <h3 className="text-lg font-semibold">Individual Plan</h3>
          <div className="text-2xl font-bold">$49<span className="text-sm font-normal">/month</span></div>
          <p className="text-sm text-gray-600">Full access to all features</p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Advanced bidding tools</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Unlimited dealer connections</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Priority support</span>
            </li>
          </ul>
        </Card>
      </div>

      <Button
        type="button"
        onClick={onBack}
        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
      >
        Back
      </Button>
    </div>
  );
};

export default PlanSelectionForm;
