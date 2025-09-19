import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationList from "./NotificationList";
import { cn } from "@/lib/utils";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const NotificationPanel = ({ isOpen, onClose, className }: NotificationPanelProps) => {
  return (
    <div
      className={cn(
        "fixed top-0 right-0 bottom-0 w-80 bg-white border-l-2 border-gray-300 shadow-xl z-[60] transform transition-transform duration-300 ease-in-out pt-16",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-1 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <NotificationList />
      </div>
    </div>
  );
};

export default NotificationPanel;