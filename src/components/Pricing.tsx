import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { useWaitlist } from "./waitlist/WaitlistContext";
const Pricing = () => {
  const navigate = useNavigate();
  const {
    setShowWaitlist
  } = useWaitlist();
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section id="pricing" className="py-12 sm:py-16 lg:py-24 bg-gray-50">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-primary">Simple, Flexible Pricing</h2>
          <p className="mt-3 sm:mt-4 lg:mt-6 text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">Choose the plan that's right for your business</p>
        </div>
        {/* Note: Dealership Plan removed - can be restored from version control if needed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
           {/* Beta Trial Plan */}
          <Card className="flex flex-col h-full relative border-accent">
            <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-accent text-accent-foreground px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
                Limited Time Offer
              </span>
            </div>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl">Free Beta Plan</CardTitle>
              <CardDescription className="text-sm sm:text-base">Open to all while in Beta testing</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow px-4 sm:px-6">
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl sm:text-3xl font-bold">$0</span>
                <span className="ml-1 text-sm sm:text-base text-gray-500">/per user/per mo.</span>
              </div>
              <ul className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                <li className="flex items-center">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Free while in Beta</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Unlimited bid requests</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Buybid dashboard</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-4 sm:pt-6">
              <Button onClick={() => navigate('/signup')} className="w-full bg-accent hover:bg-accent/90 text-sm sm:text-base py-2 sm:py-3">Start Free Trial</Button>
            </CardFooter>
          </Card>

          {/* Buybid Connect Plan */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl">Buybid Connect</CardTitle>
              <CardDescription className="text-sm sm:text-base">For buyers looking to expand their network</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow px-4 sm:px-6">
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl sm:text-3xl font-bold">$99</span>
                <span className="ml-1 text-sm sm:text-base text-gray-500">/per mo.</span>
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
                  <span className="text-sm sm:text-base">Lifetime Price Lock</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-4 sm:pt-6">
              <Button onClick={() => navigate('/signup')} className="w-full bg-accent hover:bg-accent/90 text-sm sm:text-base py-2 sm:py-3">Get Started</Button>
            </CardFooter>
          </Card>

          {/* Annual Plan */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl">Annual Plan</CardTitle>
              <CardDescription className="text-sm sm:text-base">Best value for committed users</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow px-4 sm:px-6">
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl sm:text-3xl font-bold text-foreground">$599</span>
                <span className="ml-1 text-sm sm:text-base text-muted-foreground">/per yr</span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-accent font-medium">Less than $50 per mo.</p>
              <ul className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                <li className="flex items-center">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Includes Free Plan</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">No annual commitment</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Billed Annually</span>
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
            <CardFooter className="pt-4 sm:pt-6">
              <Button onClick={() => navigate('/signup')} className="w-full bg-accent hover:bg-accent/90 text-sm sm:text-base py-2 sm:py-3">Get Started</Button>
            </CardFooter>
          </Card>

        </div>
      </div>
    </section>;
};
export default Pricing;