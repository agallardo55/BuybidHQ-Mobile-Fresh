
import { Link } from "react-router-dom";
import { UserRound, Bell, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationList from "../notifications/NotificationList";

interface UserActionsProps {
  unreadCount: number;
  onLogout: () => void;
  onClick?: () => void;
  className?: string;
}

const UserActions = ({ unreadCount, onLogout, onClick, className = "" }: UserActionsProps) => {
  return (
    <div className={`flex items-center space-x-6 ${className}`}>
      <Link 
        to="/account"
        className="p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
        aria-label="Account"
        onClick={onClick}
      >
        <UserRound className="h-5 w-5" />
      </Link>
      <Popover>
        <PopoverTrigger asChild>
          <button 
            className="relative p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
            aria-label="Notifications"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
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
        </PopoverTrigger>
        <PopoverContent className="w-[380px] p-0" align="end">
          <NotificationList />
        </PopoverContent>
      </Popover>
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
