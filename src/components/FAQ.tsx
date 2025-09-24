import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <section id="faq" className="py-20 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get answers to common questions about BuyBidHQ and how our platform works
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6 bg-white shadow-sm">
            <AccordionTrigger className="text-left text-gray-900 hover:text-blue-600">
              How does BuybidHQ work?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              BuyBidHQ allows auto dealers and wholesalers to send bid requests via SMS or email to their dealer network. Buyers respond with their offers, and you can track all responses in one central dashboard.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6 bg-white shadow-sm">
            <AccordionTrigger className="text-left text-gray-900 hover:text-blue-600">
              Are there any additional fees?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              No, there are not additional auction or processing fees. The offer you accept is the offer you and your buyer agree too.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6 bg-white shadow-sm">
            <AccordionTrigger className="text-left text-gray-900 hover:text-blue-600">
              Can I send bid requests via both SMS and email?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes! We supports both SMS and email for sending bid requests. You can choose your preferred method or use both depending on your buyers' preferences and your communication strategy.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6 bg-white shadow-sm">
            <AccordionTrigger className="text-left text-gray-900 hover:text-blue-600">
              How is BuybidHQ different than auctions?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Forget the hassle of auctions. BuyBidHQ lets you privately share vehicles with your trusted buyer network—no fees, no time pressure, just competitive offers when you're ready.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-6 bg-white shadow-sm">
            <AccordionTrigger className="text-left text-gray-900 hover:text-blue-600">
              Is my data secure and private?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Absolutely. We use enterprise-grade security with Supabase backend, multi-factor authentication, encrypted data transmission, and secure cloud storage. Your vehicle data, buyer information, and bid details are protected with industry-standard security measures.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border border-gray-200 rounded-lg px-6 bg-white shadow-sm">
            <AccordionTrigger className="text-left text-gray-900 hover:text-blue-600">
              Is there a mobile app available?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes! BuyBidHQ is available as both a web application and mobile apps for iOS and Android (built with React/Capacitor). The mobile app includes all features including VIN scanning, photo capture, and bid management on the go.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border border-gray-200 rounded-lg px-6 bg-white shadow-sm">
            <AccordionTrigger className="text-left text-gray-900 hover:text-blue-600">
              How do I get started with BuyBidHQ?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Getting started is easy! Sign up for a free trial, set up your dealership profile, add your buyer contacts, and start creating bid requests. Our support team provides onboarding assistance, and you can upgrade to a paid plan when you're ready to unlock all features.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;