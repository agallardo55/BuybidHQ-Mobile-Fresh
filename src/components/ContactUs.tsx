
import { Mail, MessageSquare, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ReCAPTCHA from "react-google-recaptcha";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSiteKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-recaptcha-key');
        if (error) throw error;
        setSiteKey(data.siteKey);
      } catch (error) {
        console.error('Error fetching reCAPTCHA site key:', error);
        toast({
          variant: "destructive",
          title: "Error loading reCAPTCHA",
          description: "Please refresh the page and try again.",
        });
      } finally {
        setIsLoadingKey(false);
      }
    };

    fetchSiteKey();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryType) {
      toast({
        variant: "destructive",
        title: "Inquiry type required",
        description: "Please select an inquiry type",
      });
      return;
    }

    if (!captchaValue) {
      toast({
        variant: "destructive",
        title: "Verification required",
        description: "Please complete the captcha verification",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // First verify the reCAPTCHA token
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token: captchaValue }
      });

      if (verifyError || !verifyData?.success) {
        throw new Error('reCAPTCHA verification failed');
      }

      // If verification successful, proceed with sending the email
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: { name, email, message, inquiryType }
      });

      if (error) throw error;

      toast({
        title: "Message sent successfully",
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form
      setName("");
      setEmail("");
      setMessage("");
      setInquiryType("");
      setCaptchaValue(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
  };

  return (
    <section id="contact" className="py-24 bg-secondary">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Contact Us</h2>
          <p className="mt-4 text-lg text-gray-600">Get in touch with our team for any questions or support</p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="inquiryType">Inquiry Type</Label>
              <Select value={inquiryType} onValueChange={setInquiryType}>
                <SelectTrigger id="inquiryType">
                  <SelectValue placeholder="Select inquiry type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="general">General Question</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                className="min-h-[120px] focus-visible:ring-custom-blue"
                required
              />
            </div>
            <div className="flex justify-center">
              {isLoadingKey ? (
                <div className="text-sm text-gray-500">Loading reCAPTCHA...</div>
              ) : siteKey ? (
                <ReCAPTCHA
                  sitekey={siteKey}
                  onChange={handleCaptchaChange}
                />
              ) : (
                <div className="text-sm text-red-500">Error loading reCAPTCHA</div>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isSubmitting || !siteKey}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
