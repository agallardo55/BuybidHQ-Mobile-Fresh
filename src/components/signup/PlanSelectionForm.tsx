import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ComingSoonBadge } from "@/components/ui/coming-soon-badge";
import { PlanType } from "@/hooks/signup/types";
interface PlanSelectionFormProps {
  onSelect: (plan: PlanType) => void;
  onBack: () => void;
}
const PlanSelectionForm = ({
  onSelect,
  onBack
}: PlanSelectionFormProps) => {
  return <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 cursor-pointer hover:border-accent" onClick={() => onSelect('beta-access')}>
          <h3 className="text-lg font-semibold">Free Plan</h3>
          <div className="text-2xl font-bold">$0<span className="text-sm font-normal">/per user/per mo.</span></div>
          <p className="text-sm text-gray-600">Perfect for the individual dealer</p>
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
          <h3 className="text-lg font-semibold">Buybid Connect </h3>
          <div className="text-2xl font-bold">$5<span className="text-sm font-normal">/per buybid</span></div>
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
      </div>
    </div>;
};
export default PlanSelectionForm;