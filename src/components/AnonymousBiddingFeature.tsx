
import { ArrowRight, Shield, Handshake, MessageCircle } from "lucide-react";

const AnonymousBiddingFeature = () => {
  const features = [
    {
      icon: <Shield className="h-12 w-12 text-accent" />,
      title: "Anonymous Bidding",
      description: "Submit bids anonymously to dealers. Keep your identity protected until you choose to reveal it."
    },
    {
      icon: <MessageCircle className="h-12 w-12 text-accent" />,
      title: "Secure Communication",
      description: "Exchange messages through our platform while maintaining your anonymity throughout the negotiation process."
    },
    {
      icon: <Handshake className="h-12 w-12 text-accent" />,
      title: "Connect When You Win",
      description: "Only when your bid is accepted will your contact information be shared, ensuring a fair and protected bidding process."
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Anonymous Bidding with Buybid Connect
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Make bids without revealing your identity. Only connect when it matters.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-3xl">
            <div className="relative">
              <span className="absolute -top-3 -right-3 bg-accent text-white text-xs px-2 py-1 rounded-full font-bold">
                Buybid Connect Feature
              </span>
              <h3 className="text-xl font-semibold text-primary mb-4 text-center">How It Works</h3>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center">
                  <div className="font-bold mb-1">1. Submit Your Bid</div>
                  <p className="text-sm text-gray-600">
                    Place your bid anonymously through our secure platform
                  </p>
                </div>
                <ArrowRight className="hidden md:block h-5 w-5 text-gray-400" />
                <div className="flex-1 text-center">
                  <div className="font-bold mb-1">2. Get Notified if Selected</div>
                  <p className="text-sm text-gray-600">
                    Receive notification when your bid wins
                  </p>
                </div>
                <ArrowRight className="hidden md:block h-5 w-5 text-gray-400" />
                <div className="flex-1 text-center">
                  <div className="font-bold mb-1">3. Connect Directly</div>
                  <p className="text-sm text-gray-600">
                    Connect with the seller to finalize your deal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnonymousBiddingFeature;
