import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Notification, NotificationContent } from "./types";
import { DollarSign, Bell } from "lucide-react";

// Type guard to check if an object has the expected notification content structure
const isValidNotificationContent = (content: unknown): content is NotificationContent => {
  if (!content || typeof content !== 'object') return false;
  const c = content as Record<string, unknown>;
  
  // All fields are optional, but if they exist they must match the expected structure
  if (c.vehicle !== undefined && (
    typeof c.vehicle !== 'object' ||
    !c.vehicle ||
    typeof (c.vehicle as any).year !== 'string' ||
    typeof (c.vehicle as any).make !== 'string' ||
    typeof (c.vehicle as any).model !== 'string'
  )) {
    return false;
  }

  if (c.buyer !== undefined && (
    typeof c.buyer !== 'object' ||
    !c.buyer ||
    typeof (c.buyer as any).name !== 'string' ||
    typeof (c.buyer as any).dealer !== 'string'
  )) {
    return false;
  }

  if (c.offer_amount !== undefined && typeof c.offer_amount !== 'number') {
    return false;
  }

  if (c.bid_request_id !== undefined && typeof c.bid_request_id !== 'string') {
    return false;
  }

  return true;
};

const getNotificationToastContent = (type: string, content: NotificationContent) => {
  try {
    switch (type) {
      case "bid_response":
        if (!content.vehicle || !content.buyer || !content.offer_amount) {
          throw new Error("Invalid bid response notification content");
        }
        return {
          title: "New Bid Response",
          description: `${content.buyer.name} from ${content.buyer.dealer} offered $${content.offer_amount.toLocaleString()} for your ${content.vehicle.year} ${content.vehicle.make} ${content.vehicle.model}`,
          variant: "default" as const
        };
      case "bid_request":
        return {
          title: "New Bid Request",
          description: content.vehicle 
            ? `New bid request for ${content.vehicle.year} ${content.vehicle.make} ${content.vehicle.model}`
            : "New bid request received",
          variant: "default" as const
        };
      case "bid_accepted":
        return {
          title: "Bid Accepted",
          description: content.vehicle 
            ? `Your bid for ${content.vehicle.year} ${content.vehicle.make} ${content.vehicle.model} was accepted`
            : "Your bid was accepted",
          variant: "default" as const
        };
      case "bid_declined":
        return {
          title: "Bid Declined",
          description: content.vehicle 
            ? `Your bid for ${content.vehicle.year} ${content.vehicle.make} ${content.vehicle.model} was declined`
            : "Your bid was declined",
          variant: "destructive" as const
        };
      default:
        return {
          title: "Notification",
          description: "New notification received",
          variant: "default" as const
        };
    }
  } catch (error) {
    console.error('Error processing notification:', error);
    return {
      title: "Notification",
      description: "Unable to display notification content",
      variant: "default" as const
    };
  }
};

export const useNotificationToasts = () => {
  const { toast } = useToast();

  useEffect(() => {
    const subscribeToNotifications = () => {
      const channel = supabase
        .channel('notification-toasts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            try {
              const newNotification = payload.new as any;
              
              // Parse content if it's a string
              let parsedContent: unknown = newNotification.content;
              if (typeof parsedContent === 'string') {
                try {
                  parsedContent = JSON.parse(parsedContent);
                } catch (e) {
                  console.error('Invalid notification content:', newNotification);
                  parsedContent = {};
                }
              }

              // Validate and create a proper content object
              const validContent: NotificationContent = isValidNotificationContent(parsedContent) 
                ? parsedContent 
                : {};

              // Show toast notification
              const toastContent = getNotificationToastContent(newNotification.type, validContent);
              
              toast({
                title: toastContent.title,
                description: toastContent.description,
                variant: toastContent.variant,
              });
              
            } catch (error) {
              console.error('Error processing new notification:', error);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const unsubscribe = subscribeToNotifications();
    return unsubscribe;
  }, [toast]);
};