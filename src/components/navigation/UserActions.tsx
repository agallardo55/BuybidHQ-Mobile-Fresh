
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
  const userRole = currentUser?.app_role === 'super_admin' ? 'Super Admin' :
                   currentUser?.app_role === 'account_admin' ? 'Administrator' :
                   currentUser?.role === 'admin' ? 'Administrator' : '';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <NotificationButton unreadCount={unreadCount} />

      <div className="h-5 w-px bg-slate-200" />

      <Link
        to="/account"
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-slate-50 transition-colors group"
        aria-label="Account"
        onClick={onClick}
      >
        <Avatar className="h-7 w-7 ring-1 ring-slate-200">
          <AvatarImage
            src={currentUser?.profile_photo || ""}
            alt={currentUser?.full_name || "User avatar"}
          />
          <AvatarFallback className="text-[11px] font-medium bg-slate-100 text-slate-700">
            {getInitials(currentUser?.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="hidden lg:block">
          <div className="text-[12px] font-medium text-slate-900 leading-tight">
            {currentUser?.full_name?.split(' ')[0] || 'User'}
          </div>
          {userRole && (
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 leading-tight">
              {userRole}
            </div>
          )}
        </div>
      </Link>

      <button
        onClick={() => {
          onLogout();
          onClick?.();
        }}
        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors rounded-md"
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
};

export default UserActions;
