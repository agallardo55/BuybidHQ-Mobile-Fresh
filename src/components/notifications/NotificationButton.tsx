import React from "react";
import NotificationDropdown from "./NotificationDropdown";

interface NotificationButtonProps {
  unreadCount: number;
  trigger?: React.ReactNode;
}

const NotificationButton = ({ unreadCount, trigger }: NotificationButtonProps) => {
  return <NotificationDropdown unreadCount={unreadCount} trigger={trigger} />;
};

export default NotificationButton;