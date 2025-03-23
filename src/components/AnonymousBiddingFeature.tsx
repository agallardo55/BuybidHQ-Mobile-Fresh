import { Shield, Scale, Handshake, ArrowRight, Lock, CheckCircle2, UserCheck } from "lucide-react";
const AnonymousBiddingFeature = () => {
  const features = [{
    icon: <UserCheck className="h-12 w-12 text-accent" />,
    title: "Verified Buyer Network",
    description: "Receive competitive offers from pre-screened, trusted dealers in our verified buyer network."
  }, {
    icon: <Scale className="h-12 w-12 text-accent" />,
    title: "No Negotiation Needed",
    description: "Skip the back-and-forth - simply submit your bid request and wait for the right offer."
  }, {
    icon: <Handshake className="h-12 w-12 text-accent" />,
    title: "Connect when Ready",
    description: "Your identity is only shared when you have accepted an offer from your chosen bidder."
  }];
  const steps = [{
    icon: <Lock className="h-8 w-8 text-white bg-accent p-1 rounded-full" />,
    title: "Submit Anonymous Bid",
    description: "Place your bid through our secure platform without revealing your identity"
  }, {
    icon: <MessageCircle className="h-8 w-8 text-white bg-accent p-1 rounded-full" />,
    title: "Negotiate Securely",
    description: "Discuss details while maintaining your privacy throughout the process"
  }, {
    icon: <CheckCircle2 className="h-8 w-8 text-white bg-accent p-1 rounded-full" />,
    title: "Connect When Ready",
    description: "Only share your information when you're satisfied with the deal terms"
  }];
  return <section className="py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Buybid Connect™ Anonymous Bidding
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Our innovative platform allows you to receive anonymous bids from verified buyers, connecting only when a deal is ready to close.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => <div key={index} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>)}
        </div>
        
        <div className="bg-gray-50 rounded-xl p-8 shadow-sm max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold text-center text-primary mb-8">How Buybid Connect™ Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => <div key={index} className="flex flex-col items-center text-center relative">
                <div className="mb-4">
                  {step.icon}
                </div>
                <h4 className="text-lg font-semibold text-primary mb-2">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
                
                {index < steps.length - 1 && <ArrowRight className="hidden md:block absolute top-8 -right-3 text-gray-300 h-6 w-6" />}
              </div>)}
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-block px-4 py-2 bg-accent/10 text-accent font-medium text-sm rounded-full">
              Protect your identity while still connecting with the right dealers
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default AnonymousBiddingFeature;
