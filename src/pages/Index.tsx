
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import ContactUs from "@/components/ContactUs";
import AppDownload from "@/components/AppDownload";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

const Index = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <Navigation />
      <div className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
        <ContactUs />
        <AppDownload />
      </div>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
