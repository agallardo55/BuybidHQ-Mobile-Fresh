import React from "react";
import { Bell } from "lucide-react";

interface NotificationButtonProps {
  unreadCount: number;
  trigger?: React.ReactNode;
}

const NotificationButton = ({ unreadCount, trigger }: NotificationButtonProps) => {
  const defaultTrigger = (
    <button 
      className="relative p-2 transition-colors rounded-full hover:bg-gray-100 text-gray-500 hover:text-accent"
      aria-label="Notifications"
      onClick={() => {
        // This is just a visual indicator now - notifications will appear as toasts
      }}
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

  return trigger || defaultTrigger;
};

export default NotificationButton;