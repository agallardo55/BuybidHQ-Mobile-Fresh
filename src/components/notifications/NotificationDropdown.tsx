import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, X, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "./useNotifications";
import { Notification } from "./types";

interface NotificationDropdownProps {
  unreadCount: number;
  trigger?: React.ReactNode;
}

const NotificationDropdown = ({ unreadCount, trigger }: NotificationDropdownProps) => {
  const {
    notifications,
    isLoading,
    markAsRead,
    clearNotification,
    markAllAsRead,
    clearAllNotifications
  } = useNotifications();

  const defaultTrigger = (
    <button 
      className="relative p-2 transition-colors rounded-full hover:bg-muted text-muted-foreground hover:text-accent"
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_response':
        return '💰';
      case 'bid_request':
        return '🚗';
      case 'bid_accepted':
        return '✅';
      case 'bid_declined':
        return '❌';
      default:
        return '📢';
    }
  };

  const formatNotificationContent = (notification: Notification) => {
    const { type, content } = notification;
    
    switch (type) {
      case 'bid_response':
        return `New bid of $${content.offer_amount?.toLocaleString()} for your ${content.vehicle?.year} ${content.vehicle?.make} ${content.vehicle?.model} from ${content.buyer?.name}`;
      case 'bid_request':
        return `New bid request for ${content.vehicle?.year} ${content.vehicle?.make} ${content.vehicle?.model}`;
      case 'bid_accepted':
        return `Your bid of $${content.offer_amount?.toLocaleString()} was accepted for ${content.vehicle?.year} ${content.vehicle?.make} ${content.vehicle?.model}`;
      case 'bid_declined':
        return `Your bid of $${content.offer_amount?.toLocaleString()} was declined for ${content.vehicle?.year} ${content.vehicle?.make} ${content.vehicle?.model}`;
      default:
        return 'New notification';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {notifications.length > 0 && (
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-7 px-2 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        <Separator />
        
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="p-1">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div className={`p-3 rounded-lg mx-1 mb-1 group hover:bg-muted/50 transition-colors ${
                    !notification.read_at ? 'bg-accent/10' : ''
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="text-lg flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-5 break-words">
                          {formatNotificationContent(notification)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read_at && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead([notification.id])}
                                className="h-6 px-2 text-xs"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => clearNotification(notification.id)}
                              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {!notification.read_at && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="mx-3" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;