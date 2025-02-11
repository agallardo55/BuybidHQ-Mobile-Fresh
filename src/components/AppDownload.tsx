
import { Clock } from "lucide-react";

const AppDownload = () => {
  return (
    <section className="bg-secondary py-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-primary">
            Coming Soon
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Download our mobile app for instant access to bid requests and vehicle listing management on the go
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-black/80 text-white px-6 py-3 rounded-lg cursor-not-allowed opacity-80">
              <Clock className="h-6 w-6" />
              <div className="text-left">
                <div className="text-xs">Download on</div>
                <div className="text-lg font-semibold">App Store</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/80 text-white px-6 py-3 rounded-lg cursor-not-allowed opacity-80">
              <Clock className="h-6 w-6" />
              <div className="text-left">
                <div className="text-xs">Download on</div>
                <div className="text-lg font-semibold">Google Play</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;
