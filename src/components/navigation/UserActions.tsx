
import React from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import NotificationButton from "../notifications/NotificationButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserData } from "@/hooks/useCurrentUser";

interface UserActionsProps {
  unreadCount: number;
  onLogout: () => void;
  onClick?: () => void;
  className?: string;
  currentUser?: UserData | null;
}

const getInitials = (name?: string | null): string => {
  if (!name) return "U";
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

const UserActions = ({ 
  unreadCount, 
  onLogout, 
  onClick, 
  className = "",
  currentUser
}: UserActionsProps) => {
  return (
    <div className={`flex items-center space-x-6 ${className}`}>
      <NotificationButton unreadCount={unreadCount} />
      <Link 
        to="/account"
        className="p-1 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
        aria-label="Account"
        onClick={onClick}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={currentUser?.profile_photo || ""} 
            alt={currentUser?.full_name || "User avatar"} 
          />
          <AvatarFallback className="text-sm">
            {getInitials(currentUser?.full_name)}
          </AvatarFallback>
        </Avatar>
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
