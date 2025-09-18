
import { formatDistanceToNow } from "date-fns";
import { DollarSign, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationContent } from "./types";

interface NotificationItemProps {
  id: string;
  type: "bid_request" | "bid_response" | "bid_accepted" | "bid_declined";
  content: NotificationContent;
  createdAt: string;
  read: boolean;
  onRead: (id: string) => void;
}

const NotificationItem = ({ id, type, content, createdAt, read, onRead }: NotificationItemProps) => {
  const getNotificationContent = () => {
    try {
      switch (type) {
        case "bid_response":
          if (!content.vehicle || !content.buyer || !content.offer_amount) {
            throw new Error("Invalid bid response notification content");
          }
          return {
            icon: <DollarSign className="h-5 w-5 text-accent" />,
            title: "New Bid Response",
            description: `${content.buyer.name} from ${content.buyer.dealer} offered $${content.offer_amount.toLocaleString()} for your ${content.vehicle.year} ${content.vehicle.make} ${content.vehicle.model}`
          };
        case "bid_request":
          return {
            icon: <Bell className="h-5 w-5 text-blue-500" />,
            title: "New Bid Request",
            description: content.vehicle 
              ? `New bid request for ${content.vehicle.year} ${content.vehicle.make} ${content.vehicle.model}`
              : "New bid request received"
          };
        case "bid_accepted":
          return {
            icon: <Bell className="h-5 w-5 text-green-500" />,
            title: "Bid Accepted",
            description: content.vehicle 
              ? `Your bid for ${content.vehicle.year} ${content.vehicle.make} ${content.vehicle.model} was accepted`
              : "Your bid was accepted"
          };
        case "bid_declined":
          return {
            icon: <Bell className="h-5 w-5 text-red-500" />,
            title: "Bid Declined",
            description: content.vehicle 
              ? `Your bid for ${content.vehicle.year} ${content.vehicle.make} ${content.vehicle.model} was declined`
              : "Your bid was declined"
          };
        default:
          return {
            icon: <Bell className="h-5 w-5 text-gray-400" />,
            title: "Notification",
            description: "New notification received"
          };
      }
    } catch (error) {
      console.error('Error processing notification:', error);
      return {
        icon: <Bell className="h-5 w-5 text-gray-400" />,
        title: "Notification",
        description: "Unable to display notification content"
      };
    }
  };

  const { icon, title, description } = getNotificationContent();

  const formattedTime = (() => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'recently';
    }
  })();

  return (
    <div 
      className={cn(
        "p-4 transition-colors cursor-pointer border-b border-border/20 last:border-b-0 hover:bg-gray-50/30",
        read ? "opacity-75" : ""
      )}
      onClick={() => !read && onRead(id)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-gray-900", read ? "font-normal" : "font-semibold")}>{title}</p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
          <p className="text-xs text-gray-400 mt-2">{formattedTime}</p>
        </div>
        {!read && (
          <div className="h-2 w-2 bg-accent rounded-full flex-shrink-0" />
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
