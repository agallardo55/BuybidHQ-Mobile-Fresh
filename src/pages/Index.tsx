
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import ContactUs from "@/components/ContactUs";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <Hero />
      <HowItWorks />
      <Pricing />
      <ContactUs />
      <Footer />
    </div>
  );
};

export default Index;
