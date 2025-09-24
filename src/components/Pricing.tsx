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
  return <section id="pricing" className="py-24 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Simple, Flexible Pricing</h2>
          <p className="mt-4 text-lg text-gray-600">Choose the plan that's right for your business</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Beta Trial Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">Free Plan</CardTitle>
              <CardDescription>Perfect for the individual members</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">$0</span>
                <span className="ml-1 text-gray-500">/per mo.</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>10 buybids per mo.</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Unlimited buyer connections</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Dashboard Access</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setShowWaitlist(true)} className="w-full bg-accent hover:bg-accent/90">Start Free Trial</Button>
            </CardFooter>
          </Card>

          {/* Pay per Buybid Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">Connect Plan</CardTitle>
              <CardDescription>For buyers looking to expand their network</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">$99</span>
                <span className="ml-1 text-gray-500">/per mo</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Unlimited buybids per mo.</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Billed Monthly</span>
                </li>
                
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Dashboard Access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>All Basic features</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setShowWaitlist(true)} className="w-full bg-accent hover:bg-accent/90">Get Started</Button>
            </CardFooter>
          </Card>

          {/* Annual Plan */}
          <Card className="flex flex-col border-2 border-accent relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Annual Plan</CardTitle>
              <CardDescription>Save with our annual subscription</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">$599</span>
                <span className="ml-1 text-gray-500">/per yr</span>
              </div>
              <div className="mt-1 text-sm text-accent font-medium">Less than $50 per mo.</div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Unlimited buybids per mo.</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Billed Annually</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Dashboard Access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Lifetime Rate Lock</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>All Connect features</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setShowWaitlist(true)} className="w-full bg-accent hover:bg-accent/90">Get Started</Button>
            </CardFooter>
          </Card>

          {/* Dealership Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">Group Plan</CardTitle>
              <CardDescription>For multi-store group members</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">Custom</span>
                <span className="ml-1 text-gray-500">/month</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Unlimited buybids per mo.</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Multi-user access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Dashboard Access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Buybid Analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span className="flex items-center gap-2">
                    Marketplace Access
                    
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