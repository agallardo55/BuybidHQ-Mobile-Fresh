import { useState } from "react";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NotificationList from "./NotificationList";

interface NotificationDialogProps {
  unreadCount: number;
  trigger?: React.ReactNode;
}

const NotificationDialog = ({ unreadCount, trigger }: NotificationDialogProps) => {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <button 
      className="relative p-2 transition-colors rounded-full hover:bg-gray-100 text-gray-500 hover:text-accent"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
        </span>
      )}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <NotificationList />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDialog;