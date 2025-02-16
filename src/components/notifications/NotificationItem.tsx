
import { formatDistanceToNow } from "date-fns";
import { Check, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationContent = {
  vehicle?: {
    year: string;
    make: string;
    model: string;
  };
  buyer?: {
    name: string;
    dealer: string;
  };
  offer_amount?: number;
};

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
    switch (type) {
      case "bid_response":
        return {
          icon: <DollarSign className="h-5 w-5 text-accent" />,
          title: "New Bid Response",
          description: content.vehicle && content.buyer 
            ? `${content.buyer.name} from ${content.buyer.dealer} offered $${content.offer_amount?.toLocaleString()} for your ${content.vehicle.year} ${content.vehicle.make} ${content.vehicle.model}`
            : "New bid response received"
        };
      // Add other cases as needed
      default:
        return {
          icon: <Check className="h-5 w-5 text-gray-400" />,
          title: "Notification",
          description: "New notification received"
        };
    }
  };

  const { icon, title, description } = getNotificationContent();

  return (
    <div 
      className={cn(
        "p-4 border rounded-lg transition-colors cursor-pointer",
        read ? "bg-gray-50" : "bg-white hover:bg-gray-50"
      )}
      onClick={() => !read && onRead(id)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
          <p className="text-xs text-gray-400 mt-2">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
        {!read && (
          <div className="h-2 w-2 bg-accent rounded-full flex-shrink-0" />
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
