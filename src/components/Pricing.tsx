
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

const Pricing = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-gray-600">Choose the plan that's right for your business</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {/* Beta Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">Beta Access</CardTitle>
              <CardDescription>Perfect for early adopters</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">Free</span>
                <span className="ml-1 text-gray-500">/month</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Basic bidding features</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Connect with 10 dealers</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Community support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-accent hover:bg-accent/90">Get Started</Button>
            </CardFooter>
          </Card>

          {/* Individual Plan */}
          <Card className="flex flex-col relative border-accent">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-sm rounded-full">
              Popular
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Individual</CardTitle>
              <CardDescription>For professional dealers</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">$49</span>
                <span className="ml-1 text-gray-500">/month</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Advanced bidding tools</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Unlimited dealer connections</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Analytics dashboard</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-accent hover:bg-accent/90">Start Free Trial</Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <CardDescription>For large dealerships</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">$199</span>
                <span className="ml-1 text-gray-500">/month</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Custom bidding solutions</span>
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
                  <span>Advanced analytics & reporting</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-2" />
                  <span>Custom integrations</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-accent hover:bg-accent/90">Contact Sales</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
