import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserData } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/notificationToast";
import { useQueryClient } from "@tanstack/react-query";
import { invalidatePreferencesCache } from "@/utils/notificationToast";

interface NotificationPreferencesSectionProps {
  user: UserData | null | undefined;
}

interface NotificationSettings {
  sms_bid_updates: boolean;
  sms_new_listings: boolean;
  sms_system_alerts: boolean;
}

export const NotificationPreferencesSection = ({ user }: NotificationPreferencesSectionProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    sms_bid_updates: true,
    sms_new_listings: true,
    sms_system_alerts: true,
  });

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (!user?.id) return;

      const { data } = await supabase
        .from("buybidhq_users")
        .select("notification_preferences")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.notification_preferences) {
        setSettings({
          sms_bid_updates: data.notification_preferences.sms_bid_updates ?? true,
          sms_new_listings: data.notification_preferences.sms_new_listings ?? true,
          sms_system_alerts: data.notification_preferences.sms_system_alerts ?? true,
        });
      }
    };

    fetchNotificationSettings();
  }, [user?.id]);

  const handleToggle = (field: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("buybidhq_users")
        .update({
          notification_preferences: settings,
        })
        .eq("id", user?.id);

      if (error) throw error;

      // Invalidate currentUser cache to keep user object in sync
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      // Invalidate notification preferences cache
      invalidatePreferencesCache();

      toast.success("Notification preferences committed successfully");
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">NOTIFICATION SYSTEM</h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 mt-2">
          COMMUNICATION CHANNEL CONFIGURATION
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Internal Messaging Notifications */}
        <Card className="border-slate-200 shadow-none">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 pb-1">
                INTERNAL MESSAGING
              </h3>
              <p className="text-[10px] text-slate-500 pb-3 border-b border-slate-200">
                Notification panel controls
              </p>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[11px] font-medium text-slate-900">
                    BID UPDATES
                  </Label>
                  <p className="text-[10px] text-slate-500">
                    In-app notifications for bid status changes and responses
                  </p>
                </div>
                <Switch
                  checked={settings.sms_bid_updates}
                  onCheckedChange={() => handleToggle("sms_bid_updates")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[11px] font-medium text-slate-900">
                    NEW LISTINGS
                  </Label>
                  <p className="text-[10px] text-slate-500">
                    In-app alerts for new vehicle listings
                  </p>
                </div>
                <Switch
                  checked={settings.sms_new_listings}
                  onCheckedChange={() => handleToggle("sms_new_listings")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[11px] font-medium text-slate-900">
                    SYSTEM ALERTS
                  </Label>
                  <p className="text-[10px] text-slate-500">
                    Critical account and platform notifications
                  </p>
                </div>
                <Switch
                  checked={settings.sms_system_alerts}
                  onCheckedChange={() => handleToggle("sms_system_alerts")}
                />
              </div>
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand hover:bg-brand/90 text-white h-10 px-6 text-xs font-medium uppercase tracking-widest"
        >
          {isSubmitting ? "PROCESSING..." : "UPDATE"}
        </Button>
      </form>
    </div>
  );
};
