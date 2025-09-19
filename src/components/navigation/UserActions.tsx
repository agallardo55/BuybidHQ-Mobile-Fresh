
import React from "react";
import { Link } from "react-router-dom";
import { UserRound, LogOut } from "lucide-react";
import NotificationDialog from "../notifications/NotificationDialog";

interface UserActionsProps {
  unreadCount: number;
  onLogout: () => void;
  onClick?: () => void;
  className?: string;
}

const UserActions = ({ 
  unreadCount, 
  onLogout, 
  onClick, 
  className = ""
}: UserActionsProps) => {
  return (
    <div className={`flex items-center space-x-6 ${className}`}>
      <NotificationDialog unreadCount={unreadCount} />
      <Link 
        to="/account"
        className="p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
        aria-label="Account"
        onClick={onClick}
      >
        <UserRound className="h-5 w-5" />
      </Link>
      <button 
        onClick={() => {
          onLogout();
          onClick?.();
        }}
        className="p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
        aria-label="Log out"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  );
};

export default UserActions;
