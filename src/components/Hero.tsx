import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWaitlist } from "./waitlist/WaitlistContext";
const Hero = () => {
  const {
    setShowWaitlist
  } = useWaitlist();
  const scrollToHowItWorks = () => {
    const howItWorksSection = document.getElementById('howitworks');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <div className="relative h-[70vh] overflow-hidden bg-black backface-hidden">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 w-full h-full transform-gpu backface-hidden" style={{
      backgroundImage: 'url("/lovable-uploads/7714b9d3-7b2d-44ce-acb1-c667d628a989.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'brightness(0.6)'
    }} />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 z-10 w-full h-full bg-black/30 backface-hidden" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-20 w-full h-full bg-gradient-to-b from-transparent via-black/40 to-black/60 backface-hidden" />
      
      {/* Content */}
      <div className="absolute inset-0 z-30 w-full h-full">
        <div className="h-full flex items-center">
          <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
            <div className="mx-auto max-w-3xl">
              <div className="animate-fade-in">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold leading-6 text-white ring-1 ring-inset ring-white/40 backdrop-blur-[2px]">
                  The future is now
                </span>
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl animate-slide-in" style={{
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
            }}>Connecting Wholesale Buyers and Sellers like never before.</h1>
              <p className="mt-6 text-lg leading-8 text-gray-100 animate-slide-in font-medium" style={{
              animationDelay: "0.2s",
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)'
            }}>
                Streamline your vehicle buy bids and connect with dealers instantly through our communication platform.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 animate-slide-in" style={{
              animationDelay: "0.4s"
            }}>
                <Button className="bg-[#325AE7] hover:bg-[#325AE7]/70 text-lg px-8 py-6 w-full sm:w-auto shadow-lg transition-colors duration-200" onClick={() => setShowWaitlist(true)}>
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button className="bg-white hover:bg-white/70 text-[#325AE7] text-lg px-8 py-6 w-full sm:w-auto shadow-lg transition-colors duration-200" onClick={scrollToHowItWorks}>
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Hero;