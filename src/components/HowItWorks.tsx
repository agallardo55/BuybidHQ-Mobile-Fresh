
import { MessageSquare, Search, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <MessageSquare className="w-12 h-12 text-accent" />,
      title: "Submit Your Request",
      description: "Send your vehicle details via SMS and Email to instantly create a bid request"
    },
    {
      icon: <Search className="w-12 h-12 text-accent" />,
      title: "Receive Offers",
      description: "Connected buyers review your bid requests then submit their offers"
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-accent" />,
      title: "Accept Best Offer",
      description: "Review incoming offers and accept the one that works best for you"
    }
  ];

  return (
    <section id="howitworks" className="py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600">Three simple steps to get the best offers for your vehicles</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-6 p-4 bg-accent/10 rounded-full">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-gray-200"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
