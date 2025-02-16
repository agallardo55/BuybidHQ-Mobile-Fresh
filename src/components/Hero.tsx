
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHowItWorks = () => {
    const howItWorksSection = document.getElementById('howitworks');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background Image with darker overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/lovable-uploads/94134d83-efce-4155-94dd-82f3fc460e65.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.5)',
        }}
      />
      
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 z-0 bg-black/40" />
      
      {/* Gradient overlay for better text visibility */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
          <div className="mx-auto max-w-3xl">
            <div className="animate-fade-in">
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold leading-6 text-white ring-1 ring-inset ring-white/40 backdrop-blur-md">
                The future is now
              </span>
            </div>
            <h1 
              className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl animate-slide-in"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
            >
              Revolutionizing Dealer Wholesale Buying and Selling
            </h1>
            <p 
              className="mt-6 text-lg leading-8 text-gray-100 animate-slide-in font-medium" 
              style={{ 
                animationDelay: "0.2s",
                textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)'
              }}
            >
              Streamline your vehicle buy bids and connect with dealers instantly through our communication platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 animate-slide-in" style={{ animationDelay: "0.4s" }}>
              <Button 
                className="bg-[#325AE7] hover:bg-[#325AE7]/90 text-lg px-8 py-6 w-full sm:w-auto shadow-lg"
                onClick={scrollToPricing}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="text-lg px-8 py-6 hover:bg-white/20 text-white border-white hover:text-white w-full sm:w-auto backdrop-blur-md shadow-lg"
                onClick={scrollToHowItWorks}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient decoration */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#325AE7]/30 to-[#325AE7]/30 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </div>
  );
};

export default Hero;
