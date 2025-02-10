
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-white pt-16">
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
          <div className="mx-auto max-w-3xl">
            <div className="animate-fade-in">
              <span className="rounded-full bg-[#325AE7]/10 px-3 py-1 text-sm font-semibold leading-6 text-[#325AE7] ring-1 ring-inset ring-[#325AE7]/20">
                The future is now
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-6xl animate-slide-in">
              Revolutionizing Dealer Wholesale Buying and Selling
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 animate-slide-in" style={{ animationDelay: "0.2s" }}>
              Streamline your vehicle buy bids and connect with dealers instantly through our communication platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 animate-slide-in" style={{ animationDelay: "0.4s" }}>
              <Button 
                className="bg-[#325AE7] hover:bg-[#325AE7]/90 text-lg px-8 py-6 w-full sm:w-auto"
                onClick={scrollToPricing}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="text-lg px-8 py-6 hover:bg-[#325AE7]/10 hover:text-[#325AE7] w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#325AE7]/30 to-[#325AE7]/30 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </div>
  );
};

export default Hero;
