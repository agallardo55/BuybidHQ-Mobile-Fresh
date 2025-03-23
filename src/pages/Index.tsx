
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import AnonymousBiddingFeature from "@/components/AnonymousBiddingFeature";
import Pricing from "@/components/Pricing";
import ContactUs from "@/components/ContactUs";
import AppDownload from "@/components/AppDownload";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { WaitlistOverlay } from "@/components/waitlist/WaitlistOverlay";
import { WaitlistProvider } from "@/components/waitlist/WaitlistContext";

// Check if the app is in waitlist mode
const WAITLIST_MODE = import.meta.env.VITE_WAITLIST_MODE === "true"

const Index = () => {
  if (WAITLIST_MODE) {
    return <WaitlistOverlay />
  }

  return (
    <WaitlistProvider>
      <div className="relative w-full bg-black">
        <Navigation />
        <Hero />
        <HowItWorks />
        <Features />
        <AnonymousBiddingFeature />
        <Pricing />
        <ContactUs />
        <AppDownload />
        <Footer />
        <CookieConsent />
      </div>
    </WaitlistProvider>
  );
};

export default Index;
