import { toast } from "sonner";
import { useCurrentUser } from "./useCurrentUser";
import { ToastType, ToastOptions } from "@/types/notification";

interface NotificationToast {
  success: (message: string, type?: ToastType, options?: ToastOptions) => void;
  error: (message: string, type?: ToastType, options?: ToastOptions) => void;
  warning: (message: string, type?: ToastType, options?: ToastOptions) => void;
  info: (message: string, type?: ToastType, options?: ToastOptions) => void;
}

export const useNotificationToast = (): NotificationToast => {
  const { data: user } = useCurrentUser();

  const shouldShowToast = (type?: ToastType): boolean => {
    // If no user or no preferences set, default to showing all toasts
    if (!user?.notification_preferences) {
      return true;
    }

    const prefs = user.notification_preferences;

    // Map toast type to preference setting
    switch (type) {
      case "bid_updates":
        return prefs.sms_bid_updates ?? true;
      case "new_listings":
        return prefs.sms_new_listings ?? true;
      case "system_alerts":
        return prefs.sms_system_alerts ?? true;
      default:
        // If no type specified, treat as system alert
        return prefs.sms_system_alerts ?? true;
    }
  };

  return {
    success: (message: string, type?: ToastType, options?: ToastOptions) => {
      if (shouldShowToast(type)) {
        toast.success(message, options);
      }
    },
    error: (message: string, type?: ToastType, options?: ToastOptions) => {
      if (shouldShowToast(type)) {
        toast.error(message, options);
      }
    },
    warning: (message: string, type?: ToastType, options?: ToastOptions) => {
      if (shouldShowToast(type)) {
        toast.warning(message, options);
      }
    },
    info: (message: string, type?: ToastType, options?: ToastOptions) => {
      if (shouldShowToast(type)) {
        toast.info(message, options);
      }
    },
  };
};
