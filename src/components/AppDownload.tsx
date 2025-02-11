
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
            <div className="cursor-not-allowed">
              <div className="opacity-80">
                <img
                  src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83"
                  alt="Download on the App Store"
                  style={{ height: "40px", width: "auto" }}
                  className="min-h-[40px]"
                />
              </div>
            </div>
            <div className="cursor-not-allowed">
              <div className="opacity-80">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/360px-Google_Play_Store_badge_EN.svg.png"
                  alt="Get it on Google Play"
                  style={{ height: "40px", width: "auto" }}
                  className="min-h-[40px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;
