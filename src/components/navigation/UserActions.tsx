
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserRound, Bell, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationList from "../notifications/NotificationList";

interface UserActionsProps {
  unreadCount: number;
  onLogout: () => void;
  onClick?: () => void;
  className?: string;
}

const UserActions = ({ unreadCount, onLogout, onClick, className = "" }: UserActionsProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleNotificationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMobile) {
      setIsSheetOpen(true);
    }
    onClick?.();
  };

  const NotificationButton = (
    <button 
      className="relative p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
      aria-label="Notifications"
      onClick={handleNotificationClick}
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
    <>
      <div className={`flex items-center space-x-6 ${className}`}>
        {isMobile ? (
          <Popover>
            <PopoverTrigger asChild>
              {NotificationButton}
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0 mr-4" align="start">
              <NotificationList />
            </PopoverContent>
          </Popover>
        ) : (
          NotificationButton
        )}
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

      {!isMobile && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="right" className="w-[400px] p-0">
            <SheetHeader className="p-6 pb-0">
              <SheetTitle>Notifications</SheetTitle>
            </SheetHeader>
            <div className="p-6 pt-0">
              <NotificationList />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default UserActions;
