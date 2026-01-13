import { createContext, useContext, ReactNode } from "react";
import { toast as sonnerToast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ToastType, ToastOptions } from "@/types/notification";

interface NotificationContextType {
  toast: {
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    warning: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { data: user } = useCurrentUser();

  const shouldShowToast = (type: ToastType): boolean => {
    // If no user or no preferences set, default to showing all toasts (enabled by default)
    if (!user?.notification_preferences) {
      return true;
    }

    const prefs = user.notification_preferences;

    switch (type) {
      case "bid_updates":
        return prefs.sms_bid_updates ?? true;
      case "new_listings":
        return prefs.sms_new_listings ?? true;
      case "system_alerts":
        return prefs.sms_system_alerts ?? true;
      default:
        return prefs.sms_system_alerts ?? true;
    }
  };

  // Categorize toasts based on message content
  const categorizeToast = (message: string): ToastType => {
    const lowerMessage = message.toLowerCase();

    // Bid-related keywords
    if (
      lowerMessage.includes("bid") ||
      lowerMessage.includes("offer") ||
      lowerMessage.includes("buybid")
    ) {
      return "bid_updates";
    }

    // Listing-related keywords
    if (
      lowerMessage.includes("listing") ||
      (lowerMessage.includes("vehicle") && lowerMessage.includes("added"))
    ) {
      return "new_listings";
    }

    // Everything else is a system alert
    return "system_alerts";
  };

  const toast = {
    success: (message: string, options?: ToastOptions) => {
      const type = categorizeToast(message);
      if (shouldShowToast(type)) {
        sonnerToast.success(message, options);
      }
    },
    error: (message: string, options?: ToastOptions) => {
      // Always show errors for critical system alerts
      sonnerToast.error(message, options);
    },
    warning: (message: string, options?: ToastOptions) => {
      if (shouldShowToast("system_alerts")) {
        sonnerToast.warning(message, options);
      }
    },
    info: (message: string, options?: ToastOptions) => {
      if (shouldShowToast("system_alerts")) {
        sonnerToast.info(message, options);
      }
    },
  };

  return (
    <NotificationContext.Provider value={{ toast }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
};
