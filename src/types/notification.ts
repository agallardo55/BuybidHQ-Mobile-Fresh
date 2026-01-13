/**
 * Toast notification types
 * Used by NotificationContext and useNotificationToast
 */

export type ToastType = "bid_updates" | "new_listings" | "system_alerts";

export interface ToastOptions {
  duration?: number;
  closeButton?: boolean;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export interface NotificationToast {
  success: (message: string, type?: ToastType, options?: ToastOptions) => void;
  error: (message: string, type?: ToastType, options?: ToastOptions) => void;
  warning: (message: string, type?: ToastType, options?: ToastOptions) => void;
  info: (message: string, type?: ToastType, options?: ToastOptions) => void;
}
