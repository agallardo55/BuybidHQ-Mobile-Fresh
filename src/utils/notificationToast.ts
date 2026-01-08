import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ToastType = "bid_updates" | "new_listings" | "system_alerts";

interface NotificationPreferences {
  sms_bid_updates?: boolean;
  sms_new_listings?: boolean;
  sms_system_alerts?: boolean;
}

let cachedPreferences: NotificationPreferences | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

// Fetch and cache notification preferences
const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const now = Date.now();

  // Return cached preferences if still valid
  if (cachedPreferences && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedPreferences;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Default to showing all toasts if not logged in
      return {
        sms_bid_updates: true,
        sms_new_listings: true,
        sms_system_alerts: true,
      };
    }

    const { data } = await supabase
      .from("buybidhq_users")
      .select("notification_preferences")
      .eq("id", user.id)
      .maybeSingle();

    const preferences = data?.notification_preferences || {
      sms_bid_updates: true,
      sms_new_listings: true,
      sms_system_alerts: true,
    };

    cachedPreferences = preferences;
    lastFetchTime = now;

    return preferences;
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    // Default to showing all toasts on error
    return {
      sms_bid_updates: true,
      sms_new_listings: true,
      sms_system_alerts: true,
    };
  }
};

const shouldShowToast = async (type: ToastType): Promise<boolean> => {
  try {
    // If we have fresh cached preferences, use them immediately
    const now = Date.now();
    if (cachedPreferences && (now - lastFetchTime) < CACHE_DURATION) {
      const prefs = cachedPreferences;
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
    }

    // Add short timeout to preference check to prevent hanging
    const prefsPromise = getNotificationPreferences();
    const timeoutPromise = new Promise<NotificationPreferences>((resolve) => {
      setTimeout(() => {
        resolve({
          sms_bid_updates: true,
          sms_new_listings: true,
          sms_system_alerts: true,
        });
      }, 200); // 200ms timeout (much faster)
    });

    const prefs = await Promise.race([prefsPromise, timeoutPromise]);

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
  } catch (error) {
    console.error('Error in shouldShowToast, defaulting to true:', error);
    return true;
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

// Wrapped toast functions that check preferences (drop-in replacement for sonner toast)
export const toast = {
  success: (message: string, options?: any) => {
    const type = categorizeToast(message);
    shouldShowToast(type)
      .then((should) => {
        if (should) {
          sonnerToast.success(message, options);
        }
      })
      .catch((error) => {
        console.error("Error checking notification preferences, showing toast anyway:", error);
        sonnerToast.success(message, options);
      });
  },
  error: (message: string, options?: any) => {
    // Always show errors regardless of preferences (critical alerts)
    sonnerToast.error(message, options);
  },
  warning: (message: string, options?: any) => {
    shouldShowToast("system_alerts")
      .then((should) => {
        if (should) {
          sonnerToast.warning(message, options);
        }
      })
      .catch((error) => {
        console.error("Error checking notification preferences, showing toast anyway:", error);
        sonnerToast.warning(message, options);
      });
  },
  info: (message: string, options?: any) => {
    shouldShowToast("system_alerts")
      .then((should) => {
        if (should) {
          sonnerToast.info(message, options);
        }
      })
      .catch((error) => {
        console.error("Error checking notification preferences, showing toast anyway:", error);
        sonnerToast.info(message, options);
      });
  },
};

// Export function to invalidate cache when preferences are updated
export const invalidatePreferencesCache = () => {
  cachedPreferences = null;
  lastFetchTime = 0;
};
