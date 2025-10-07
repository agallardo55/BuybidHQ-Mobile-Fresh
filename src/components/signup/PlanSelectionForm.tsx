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
  return <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <Card className="flex flex-col h-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">Free Plan</CardTitle>
            <CardDescription className="text-sm sm:text-base">Perfect for the individual dealer</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-4 sm:p-6 pt-0">
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl sm:text-3xl font-bold">$0</span>
              <span className="ml-1 text-gray-500 text-sm sm:text-base">/per user/per mo.</span>
            </div>
            <ul className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <li className="flex items-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">10 Buybids per mo.</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">Unlimited buyer connections</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">Buybid dashboard</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="p-4 sm:p-6 pt-0">
            <Button onClick={() => onSelect('beta-access')} className="w-full bg-accent hover:bg-accent/90 h-10 sm:h-11">
              Get Started
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">Buybid Connect</CardTitle>
            <CardDescription className="text-sm sm:text-base">For buyers looking to expand their network</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-4 sm:p-6 pt-0">
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl sm:text-3xl font-bold">$99</span>
              <span className="ml-1 text-gray-500 text-sm sm:text-base">/per mo.</span>
            </div>
            <ul className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <li className="flex items-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">Includes Free Plan</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">No monthly commitment</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">Billed Monthly</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">All Future Features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">Lifetime Price Lock
              </span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="p-4 sm:p-6 pt-0">
            <Button onClick={() => onSelect('pay-per-bid')} className="w-full bg-accent hover:bg-accent/90 h-10 sm:h-11">
              Get Started
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col h-full relative border-accent sm:col-span-2 lg:col-span-1">
          <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-accent text-accent-foreground px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
              Limited Time Offer
            </span>
          </div>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">Annual Plan</CardTitle>
            <CardDescription className="text-sm sm:text-base">Best value for committed users</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-4 sm:p-6 pt-0">
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl sm:text-3xl font-bold">$599</span>
              <span className="ml-1 text-gray-500 text-sm sm:text-base">/per yr</span>
            </div>
            <div className="text-sm text-accent font-semibold mt-1">
              Less than $50 per mo.
            </div>
            <ul className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <li className="flex items-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">Includes Free Plan</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">No annual commitment
              </span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">Billed Annually
              </span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">All Future Features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">Lifetime Price Lock</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="p-4 sm:p-6 pt-0">
            <Button onClick={() => onSelect('annual')} className="w-full bg-accent hover:bg-accent/90 h-10 sm:h-11">
              Get Started
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>;
};
export default PlanSelectionForm;