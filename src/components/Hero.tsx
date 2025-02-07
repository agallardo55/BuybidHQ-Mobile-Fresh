
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-white pt-16">
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
          <div className="mx-auto max-w-3xl">
            <div className="animate-fade-in">
              <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold leading-6 text-accent ring-1 ring-inset ring-accent/20">
                Announcing our new platform
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-6xl animate-slide-in">
              Revolutionizing Auto Dealer Bidding
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 animate-slide-in" style={{ animationDelay: "0.2s" }}>
              Streamline your vehicle buy bids and connect with dealers instantly through our innovative SMS-based platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-slide-in" style={{ animationDelay: "0.4s" }}>
              <Button className="bg-accent hover:bg-accent/90 text-lg px-8 py-6">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="text-lg px-8 py-6">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-accent/30 to-primary/30 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </div>
  );
};

export default Hero;
