
import { Clock } from "lucide-react";

const AppDownload = () => {
  return (
    <section className="bg-secondary py-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-primary">
            Coming Soon
          </h2>
          <p className="text-gray-600 max-w-[85%] mx-auto">
            Download our mobile app for instant access to bid requests and vehicle listing management on the go
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="relative cursor-not-allowed">
              <div className="opacity-80">
                <img
                  src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us"
                  alt="Download on the App Store"
                  style={{ height: "40px", width: "auto" }}
                  className="min-h-[40px]"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded">
                <Clock className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <div className="relative cursor-not-allowed">
              <div className="opacity-80">
                <img
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Get it on Google Play"
                  style={{ height: "40px", width: "auto" }}
                  className="min-h-[40px]"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded">
                <Clock className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;
