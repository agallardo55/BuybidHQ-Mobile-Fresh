
import { Check, Infinity } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useNavigate } from "react-router-dom";
const Pricing = () => {
  const navigate = useNavigate();
  const handleSignUp = () => {
    navigate('/signup');
  };
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section id="pricing" className="py-24 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Simple, Flexible Pricing</h2>
          <p className="mt-4 text-lg text-gray-600">Choose the plan that's right for your business</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {/* Basic Trial Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">Basic Trial</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">Free</span>
                <span className="ml-1 text-gray-500">/14 days</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>10 Buybids per mo</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Connect with 5 dealers</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Buybid dashboard</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSignUp} className="w-full bg-accent hover:bg-accent/90">Start Free Trial</Button>
            </CardFooter>
          </Card>

          {/* Individual Plan */}
          <Card className="flex flex-col relative border-accent">
            <div className="absolute -top-2 sm:-top-3 md:-top-4 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 bg-accent text-white text-xs sm:text-sm rounded-full whitespace-nowrap">Limited Time Offer</div>
            <CardHeader>
              <CardTitle className="text-2xl">Individual</CardTitle>
              <CardDescription>For individual dealers</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mt-2 relative">
                <div className="absolute -top-6 text-gray-500 line-through text-lg">$98/month</div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">$49</span>
                  <span className="ml-1 text-gray-500">/month</span>
                </div>
                <div className="text-accent text-sm mt-1">50% off for first year</div>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Advanced bidding tools</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span className="flex items-center gap-2">
                    Unlimited buybids
                    <Infinity className="h-4 w-4 text-accent" />
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Unlimited buyer connections</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Buybid dashboard</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>14-day free trial</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span className="flex items-center gap-2">
                    Marketplace Access
                    <span className="text-[#325AE7] text-sm">Coming Soon</span>
                  </span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSignUp} className="w-full bg-accent hover:bg-accent/90">
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* Dealership Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">Dealership</CardTitle>
              <CardDescription>For larger operations</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">Custom</span>
                <span className="ml-1 text-gray-500">/month</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>All Individual features</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Multi-user access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>24/7 dedicated support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span className="flex items-center gap-2">
                    Marketplace Access
                    <span className="text-[#325AE7] text-sm">Coming Soon</span>
                  </span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={scrollToContact} className="w-full bg-accent hover:bg-accent/90">
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>;
};
export default Pricing;
