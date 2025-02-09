
import { BrowserRouter } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import ContactUs from "@/components/ContactUs";
import AppDownload from "@/components/AppDownload";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white flex flex-col w-full">
        <Navigation />
        <div className="flex-1">
          <Hero />
          <HowItWorks />
          <Pricing />
          <ContactUs />
          <AppDownload />
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default Index;
