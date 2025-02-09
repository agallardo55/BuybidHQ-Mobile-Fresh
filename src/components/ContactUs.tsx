
import { Mail, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ReCAPTCHA from "react-google-recaptcha";
import { useToast } from "@/components/ui/use-toast";

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaValue) {
      toast({
        variant: "destructive",
        title: "Verification required",
        description: "Please complete the captcha verification",
      });
      return;
    }
    // In a real application, you would handle form submission here
    console.log("Form submitted:", { name, email, message, captchaValue });
  };

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
  };

  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6 text-accent" />,
      title: "Phone",
      details: "+1 (555) 000-0000",
    },
    {
      icon: <Mail className="w-6 h-6 text-accent" />,
      title: "Email",
      details: "contact@example.com",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-accent" />,
      title: "Live Chat",
      details: "Available 24/7",
    },
  ];

  return (
    <section id="contact" className="py-24 bg-secondary">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Contact Us</h2>
          <p className="mt-4 text-lg text-gray-600">Get in touch with our team for any questions or support</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          <div className="space-y-8">
            <div className="grid gap-6">
              {contactMethods.map((method, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="p-2 bg-accent/10 rounded-full">
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">{method.title}</h3>
                    <p className="text-gray-600">{method.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message"
                className="min-h-[120px]"
                required
              />
            </div>
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey="YOUR_RECAPTCHA_SITE_KEY"
                onChange={handleCaptchaChange}
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
