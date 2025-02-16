
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import NotificationItem from "./NotificationItem";
import { Notification, NotificationContent } from "./types";
import { toast } from "sonner";

// Type guard to check if an object has the expected notification content structure
const isValidNotificationContent = (content: unknown): content is NotificationContent => {
  if (!content || typeof content !== 'object') return false;
  const c = content as Record<string, unknown>;
  
  // All fields are optional, but if they exist they must match the expected structure
  if (c.vehicle !== undefined && (
    typeof c.vehicle !== 'object' ||
    !c.vehicle ||
    typeof (c.vehicle as any).year !== 'string' ||
    typeof (c.vehicle as any).make !== 'string' ||
    typeof (c.vehicle as any).model !== 'string'
  )) {
    return false;
  }

  if (c.buyer !== undefined && (
    typeof c.buyer !== 'object' ||
    !c.buyer ||
    typeof (c.buyer as any).name !== 'string' ||
    typeof (c.buyer as any).dealer !== 'string'
  )) {
    return false;
  }

  if (c.offer_amount !== undefined && typeof c.offer_amount !== 'number') {
    return false;
  }

  if (c.bid_request_id !== undefined && typeof c.bid_request_id !== 'string') {
    return false;
  }

  return true;
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    const unsubscribe = subscribeToNotifications();
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .is('cleared_at', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Validate and transform the data
      const validNotifications = (data || []).map((notification): Notification => {
        // Parse content if it's a string
        let parsedContent: unknown = notification.content;
        if (typeof parsedContent === 'string') {
          try {
            parsedContent = JSON.parse(parsedContent);
          } catch (e) {
            console.error('Invalid notification content:', notification);
            parsedContent = {};
          }
        }

        // Validate and create a proper content object
        const validContent: NotificationContent = isValidNotificationContent(parsedContent) 
          ? parsedContent 
          : {};

        return {
          id: notification.id,
          type: notification.type,
          content: validContent,
          created_at: notification.created_at,
          read_at: notification.read_at,
          cleared_at: notification.cleared_at,
          user_id: notification.user_id,
        };
      });

      setNotifications(validNotifications);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          try {
            const newNotification = payload.new as Notification;
            if (!newNotification.cleared_at) {
              setNotifications(prev => [newNotification, ...prev]);
            }
          } catch (error) {
            console.error('Error processing new notification:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('mark_notifications_as_read', {
          notification_ids: [notificationId]
        });

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleClearAll = async () => {
    try {
      const { error } = await supabase.rpc('clear_notifications');
      if (error) throw error;
      
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading notifications...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchNotifications}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-[380px]">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-gray-900">Notifications</h2>
        {notifications.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClearAll}
          >
            Clear all
          </Button>
        )}
      </div>
      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                id={notification.id}
                type={notification.type}
                content={notification.content}
                createdAt={notification.created_at}
                read={!!notification.read_at}
                onRead={handleMarkAsRead}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NotificationList;
