
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
    <div className="relative w-full bg-black">
      <Navigation />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <ContactUs />
      <AppDownload />
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
