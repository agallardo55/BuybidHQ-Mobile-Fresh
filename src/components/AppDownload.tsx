
import { Apple, Android } from "lucide-react";

const AppDownload = () => {
  return (
    <section className="bg-secondary py-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-primary">
            Download Our Mobile App
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get instant access to bid requests and manage your vehicle listings on the go with our mobile app
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Apple className="h-6 w-6" />
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="text-lg font-semibold">App Store</div>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Android className="h-6 w-6" />
              <div className="text-left">
                <div className="text-xs">Get it on</div>
                <div className="text-lg font-semibold">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;
