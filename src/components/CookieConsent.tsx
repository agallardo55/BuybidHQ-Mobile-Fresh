
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

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 animate-slide-in">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-600 text-sm text-center sm:text-left">
          This website uses cookies to ensure basic functionality and improve your experience.
        </p>
        <Button
          onClick={handleAccept}
          className="bg-accent hover:bg-accent/90 text-white min-w-[100px]"
        >
          Accept
        </Button>
      </div>
    </div>
  );
};

export default CookieConsent;
