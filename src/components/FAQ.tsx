import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <section id="faq" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get answers to common questions about BuyBidHQ and how our platform works
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border border-gray-800 rounded-lg px-6 bg-gray-900/50">
            <AccordionTrigger className="text-left text-white hover:text-primary">
              How does BuyBidHQ work for auto dealers?
            </AccordionTrigger>
            <AccordionContent className="text-gray-300">
              BuyBidHQ allows auto dealers and wholesalers to send bid requests via SMS or email to their dealer network. Buyers respond with their offers, and you can track all responses in one central dashboard.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border border-gray-800 rounded-lg px-6 bg-gray-900/50">
            <AccordionTrigger className="text-left text-white hover:text-primary">
              What's the difference between the Independent and Dealer plans?
            </AccordionTrigger>
            <AccordionContent className="text-gray-300">
              The Independent plan ($29/month) is perfect for single-user dealers with basic bid request features. The Dealer plan ($99/month) includes multi-user management, advanced analytics, priority support, and additional features for larger dealership operations.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border border-gray-800 rounded-lg px-6 bg-gray-900/50">
            <AccordionTrigger className="text-left text-white hover:text-primary">
              How does VIN scanning and decoding work?
            </AccordionTrigger>
            <AccordionContent className="text-gray-300">
              Our app includes a built-in barcode scanner for VINs and integrates with automotive APIs to automatically retrieve comprehensive vehicle details including make, model, year, engine specifications, and more. You can also manually enter VINs if preferred.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border border-gray-800 rounded-lg px-6 bg-gray-900/50">
            <AccordionTrigger className="text-left text-white hover:text-primary">
              Can I send bid requests via both SMS and email?
            </AccordionTrigger>
            <AccordionContent className="text-gray-300">
              Yes! BuyBidHQ supports both SMS (via Twilio) and email (via Resend) for sending bid requests. You can choose your preferred method or use both depending on your buyers' preferences and your communication strategy.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border border-gray-800 rounded-lg px-6 bg-gray-900/50">
            <AccordionTrigger className="text-left text-white hover:text-primary">
              How do I manage different user roles in my dealership?
            </AccordionTrigger>
            <AccordionContent className="text-gray-300">
              BuyBidHQ offers multiple user roles: Basic (free trial), Independent (single-user), Associates (employees under Dealer control), Dealers (dealer employees), and Admin (dealer admins). Each role has appropriate permissions for managing bid requests and accessing dealership data.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border border-gray-800 rounded-lg px-6 bg-gray-900/50">
            <AccordionTrigger className="text-left text-white hover:text-primary">
              Is my data secure and private?
            </AccordionTrigger>
            <AccordionContent className="text-gray-300">
              Absolutely. We use enterprise-grade security with Supabase backend, multi-factor authentication, encrypted data transmission, and secure cloud storage. Your vehicle data, buyer information, and bid details are protected with industry-standard security measures.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border border-gray-800 rounded-lg px-6 bg-gray-900/50">
            <AccordionTrigger className="text-left text-white hover:text-primary">
              Is there a mobile app available?
            </AccordionTrigger>
            <AccordionContent className="text-gray-300">
              Yes! BuyBidHQ is available as both a web application and mobile apps for iOS and Android (built with React/Capacitor). The mobile app includes all features including VIN scanning, photo capture, and bid management on the go.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8" className="border border-gray-800 rounded-lg px-6 bg-gray-900/50">
            <AccordionTrigger className="text-left text-white hover:text-primary">
              How do I get started with BuyBidHQ?
            </AccordionTrigger>
            <AccordionContent className="text-gray-300">
              Getting started is easy! Sign up for a free trial, set up your dealership profile, add your buyer contacts, and start creating bid requests. Our support team provides onboarding assistance, and you can upgrade to a paid plan when you're ready to unlock all features.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;