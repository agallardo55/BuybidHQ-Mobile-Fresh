import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { FeedbackPanel } from "./FeedbackPanel";
import { useAuth } from "@/contexts/AuthContext";

// Routes where feedback FAB should be visible
const ALLOWED_ROUTES = [
  "/dashboard",
  "/buyers",
  "/users",
  "/dealerships",
  "/create-bid-request",
  "/marketplace",
  "/account",
];

export const FeedbackFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Only show feedback button for authenticated users on allowed routes
  const isAllowedRoute = ALLOWED_ROUTES.some(route =>
    location.pathname === route || location.pathname.startsWith(route + "/")
  );

  if (!user || !isAllowedRoute) {
    return null;
  }

  return (
    <>
      {/* Feedback Panel */}
      {isOpen && <FeedbackPanel onClose={() => setIsOpen(false)} />}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-200 z-[9999] flex items-center justify-center bg-brand hover:bg-brand/90"
        aria-label="Submit feedback"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageSquare className="h-6 w-6 text-white" />
        )}
      </button>
    </>
  );
};
