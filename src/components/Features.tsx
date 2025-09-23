
import { Shield, Zap, BatteryCharging, BarChart } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Zap className="h-12 w-12 text-accent" />,
      title: "Faster Buy Bid Offers",
      description: "Send bid requests instantly to your network of buyers to get competitive offers"
    },
    {
      icon: <Shield className="h-12 w-12 text-accent" />,
      title: "Private Marketplace",
      description: "A private marketplace to connect with buyers you trust"
    },
    {
      icon: <BarChart className="h-12 w-12 text-accent" />,
      title: "Analytics Dashboard",
      description: "Track your bids and make informed decisions better than ever before"
    },
    {
      icon: <BatteryCharging className="h-12 w-12 text-accent" />,
      title: "Real-time Updates",
      description: "Get instant notifications about new bids and offers"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Powerful Features
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to streamline your vehicle bidding process
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
      </div>
    </section>
  );
};

export default Features;
