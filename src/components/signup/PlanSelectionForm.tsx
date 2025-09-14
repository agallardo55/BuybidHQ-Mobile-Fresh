import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Free Plan</CardTitle>
            <CardDescription>Perfect for the individual dealer</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-bold">$0</span>
              <span className="ml-1 text-gray-500">/per user/per mo.</span>
            </div>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>Basic bidding features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>Unlimited buyer connections</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>Buybid dashboard</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => onSelect('beta-access')} 
              className="w-full bg-accent hover:bg-accent/90"
            >
              Get Started
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Buybid Connect</CardTitle>
            <CardDescription>For buyers looking to expand their network</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-bold">$5</span>
              <span className="ml-1 text-gray-500">/per buybid</span>
            </div>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>Pay as you go</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>No monthly commitment</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>Billed weekly</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>Buybid dashboard</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>All Basic features</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => onSelect('pay-per-bid')} 
              className="w-full bg-accent hover:bg-accent/90"
            >
              Get Started
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>;
};
export default PlanSelectionForm;