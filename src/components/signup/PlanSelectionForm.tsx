import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ComingSoonBadge } from "@/components/ui/coming-soon-badge";
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
          <h3 className="text-lg font-semibold">Basic Trial</h3>
          <div className="text-2xl font-bold">Free</div>
          <p className="text-sm text-gray-600">Free while in beta</p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Basic bidding features</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Unlimited buyer connections</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Buybid dashboard</span>
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
          <div className="absolute -top-3 right-0 left-0 flex justify-center">
            <div className="bg-accent text-white px-4 py-1 rounded-full text-sm">
              Limited Time Offer
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-4">Individual</h3>
          
          <div className="space-y-1">
            <div className="text-lg line-through text-gray-400">$99/month</div>
            <div className="text-3xl font-bold">$49<span className="text-sm font-normal">/month</span></div>
            <div className="text-accent font-medium">50% off for first year</div>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Advanced bidding tools</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Unlimited buybids</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Unlimited buyer connections</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">Buybid dashboard</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">14-day free trial</span>
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-accent" />
              <div className="flex items-center gap-2">
                <span className="text-sm">Marketplace Access</span>
                <ComingSoonBadge />
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>;
};
export default PlanSelectionForm;