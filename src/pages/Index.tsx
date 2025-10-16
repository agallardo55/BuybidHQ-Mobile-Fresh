
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import AnonymousBiddingFeature from "@/components/AnonymousBiddingFeature";
import Pricing from "@/components/Pricing";
import { RecentPostsCarousel } from "@/components/RecentPostsCarousel";
import FAQ from "@/components/FAQ";
import ContactUs from "@/components/ContactUs";
import AppDownload from "@/components/AppDownload";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
// Waitlist imports removed

const Index = () => {

  return (
    <div className="relative w-full bg-black">
        <Navigation />
        <Hero />
        <HowItWorks />
        <Features />
        {/* <AnonymousBiddingFeature /> */}
        <RecentPostsCarousel />
        <Pricing />
        <FAQ />
        <ContactUs />
        <AppDownload />
        <Footer />
        <CookieConsent />
      </div>
  );
};

export default Index;
