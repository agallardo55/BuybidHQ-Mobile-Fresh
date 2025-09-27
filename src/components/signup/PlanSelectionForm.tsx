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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <span>10 Buybids per mo.</span>
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
            <Button onClick={() => onSelect('beta-access')} className="w-full bg-accent hover:bg-accent/90">
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
              <span className="text-3xl font-bold">$199</span>
              <span className="ml-1 text-gray-500">/per mo.</span>
            </div>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>Unlimited Buybids</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>No monthly commitment</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>Billed Monthly</span>
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
            <Button onClick={() => onSelect('pay-per-bid')} className="w-full bg-accent hover:bg-accent/90">
              Get Started
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col relative border-accent">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
              Limited Time Offer
            </span>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Annual Plan</CardTitle>
            <CardDescription>Best value for committed users</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-bold">$599</span>
              <span className="ml-1 text-gray-500">/per yr</span>
            </div>
            <div className="text-sm text-accent font-semibold mt-1">
              Less than $50 per mo.
            </div>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>Unlimited Buybids</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>Billed Annually</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>Buybid dashboard</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>All Connect features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-accent mr-2" />
                <span>Lifetime Rate Lock</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => onSelect('annual')} className="w-full bg-accent hover:bg-accent/90">
              Get Started
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>;
};
export default PlanSelectionForm;