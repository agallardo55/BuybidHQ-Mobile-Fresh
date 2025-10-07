import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const hasAccepted = localStorage.getItem("cookieConsent");
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);
  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  const handleRequired = () => {
    localStorage.setItem("cookieConsent", "required");
    setIsVisible(false);
  };
  if (!isVisible) return null;
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 animate-slide-in">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-600 text-sm text-center sm:text-left">This website uses cookies to improve your experience. Some cookies are essential for site functionality, while others help us analyze traffic and personalize content. By clicking ‘Accept,’ you agree to our use of cookies. </p>
        <div className="flex gap-2 sm:gap-3">
          <Button onClick={handleRequired} className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 min-w-[100px]">
            Required
          </Button>
          <Button onClick={handleAccept} className="bg-accent hover:bg-accent/90 text-white min-w-[100px]">
            Accept
          </Button>
        </div>
      </div>
    </div>;
};
export default CookieConsent;