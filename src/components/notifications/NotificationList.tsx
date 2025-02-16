
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import NotificationItem from "./NotificationItem";

const NotificationList = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
          setNotifications(prev => [payload.new, ...prev]);
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
    }
  };

  const handleClearAll = async () => {
    try {
      const { error } = await supabase.rpc('clear_notifications');
      if (error) throw error;
      
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading notifications...</div>;
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
