
import { ArrowRight, Shield, Handshake, MessageCircle } from "lucide-react";

const AnonymousBiddingFeature = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-4">
            Anonymous Bidding with Buybid Connect
          </h2>
          <p className="text-lg text-gray-600">
            Make bids without revealing your identity. Only connect when it matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <Shield className="h-12 w-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Anonymous Bidding</h3>
            <p className="text-gray-600">
              Submit bids anonymously to dealers. Keep your identity protected until you choose to reveal it.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <MessageCircle className="h-12 w-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Secure Communication</h3>
            <p className="text-gray-600">
              Exchange messages through our platform while maintaining your anonymity throughout the negotiation process.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <Handshake className="h-12 w-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Connect When You Win</h3>
            <p className="text-gray-600">
              Only when your bid is accepted will your contact information be shared, ensuring a fair and protected bidding process.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="relative inline-flex items-center justify-center p-6 bg-accent text-white rounded-lg shadow-lg">
            <div className="absolute -top-3 -right-3 bg-white text-accent text-sm px-3 py-1 rounded-full font-bold shadow">
              Buybid Connect Feature
            </div>
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold mb-3">How It Works</h3>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <div className="flex-1 text-left">
                  <div className="font-bold mb-1">1. Submit Your Bid</div>
                  <p className="text-sm md:text-base">
                    Place your bid anonymously through our secure platform
                  </p>
                </div>
                <ArrowRight className="hidden md:block h-6 w-6" />
                <div className="flex-1 text-left">
                  <div className="font-bold mb-1">2. Get Notified if Selected</div>
                  <p className="text-sm md:text-base">
                    Receive notification when your bid wins
                  </p>
                </div>
                <ArrowRight className="hidden md:block h-6 w-6" />
                <div className="flex-1 text-left">
                  <div className="font-bold mb-1">3. Connect Directly</div>
                  <p className="text-sm md:text-base">
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
