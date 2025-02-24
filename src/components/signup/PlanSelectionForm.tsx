import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
interface PlanSelectionFormProps {
  onSelect: (plan: 'beta-access' | 'individual' | 'pay-per-bid') => void;
  onBack: () => void;
}
const PlanSelectionForm = ({
  onSelect,
  onBack
}: PlanSelectionFormProps) => {
  return <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 cursor-pointer hover:border-accent" onClick={() => onSelect('beta-access')}>
          <h3 className="text-lg font-semibold">Beta Trial</h3>
          <div className="text-2xl font-bold">Free</div>
          <p className="text-sm text-gray-600">Free while in beta</p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Unlimited buybids</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Unlimited buyer connections</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 space-y-4 cursor-pointer hover:border-accent" onClick={() => onSelect('pay-per-bid')}>
          <h3 className="text-lg font-semibold">Pay per Buybid</h3>
          <div className="text-2xl font-bold">$5<span className="text-sm font-normal">/buybid</span></div>
          <p className="text-sm text-gray-600">For occasional users</p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Pay as you go</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">No monthly commitment</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Billed weekly</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Buybid dashboard</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">All Basic features</span>
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
    </div>;
};
export default PlanSelectionForm;