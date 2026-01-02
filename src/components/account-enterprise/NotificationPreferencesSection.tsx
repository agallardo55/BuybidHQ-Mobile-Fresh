import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserData } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationPreferencesSectionProps {
  user: UserData | null | undefined;
}

interface NotificationSettings {
  email_bid_updates: boolean;
  email_new_listings: boolean;
  email_system_alerts: boolean;
  sms_bid_updates: boolean;
  sms_new_listings: boolean;
  sms_system_alerts: boolean;
}

export const NotificationPreferencesSection = ({ user }: NotificationPreferencesSectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_bid_updates: true,
    email_new_listings: true,
    email_system_alerts: true,
    sms_bid_updates: false,
    sms_new_listings: false,
    sms_system_alerts: false,
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
          email_bid_updates: data.notification_preferences.email_bid_updates ?? true,
          email_new_listings: data.notification_preferences.email_new_listings ?? true,
          email_system_alerts: data.notification_preferences.email_system_alerts ?? true,
          sms_bid_updates: data.notification_preferences.sms_bid_updates ?? false,
          sms_new_listings: data.notification_preferences.sms_new_listings ?? false,
          sms_system_alerts: data.notification_preferences.sms_system_alerts ?? false,
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
        {/* Electronic Mail Notifications */}
        <Card className="border-slate-200 shadow-none">
          <div className="p-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 pb-3 border-b border-slate-200">
              ELECTRONIC MAIL
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[11px] font-medium text-slate-900">
                    BID UPDATES
                  </Label>
                  <p className="text-[10px] text-slate-500">
                    Notifications for bid status changes and responses
                  </p>
                </div>
                <Switch
                  checked={settings.email_bid_updates}
                  onCheckedChange={() => handleToggle("email_bid_updates")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[11px] font-medium text-slate-900">
                    NEW LISTINGS
                  </Label>
                  <p className="text-[10px] text-slate-500">
                    Alerts for new vehicle listings matching your preferences
                  </p>
                </div>
                <Switch
                  checked={settings.email_new_listings}
                  onCheckedChange={() => handleToggle("email_new_listings")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[11px] font-medium text-slate-900">
                    SYSTEM ALERTS
                  </Label>
                  <p className="text-[10px] text-slate-500">
                    Important account and platform notifications
                  </p>
                </div>
                <Switch
                  checked={settings.email_system_alerts}
                  onCheckedChange={() => handleToggle("email_system_alerts")}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* SMS Service Notifications */}
        <Card className="border-slate-200 shadow-none">
          <div className="p-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 pb-3 border-b border-slate-200">
              SMS SERVICE
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[11px] font-medium text-slate-900">
                    BID UPDATES
                  </Label>
                  <p className="text-[10px] text-slate-500">
                    Text notifications for bid status changes and responses
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
                    Text alerts for new vehicle listings
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
                    Critical account and platform notifications via SMS
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
          {isSubmitting ? "PROCESSING..." : "COMMIT CHANGES"}
        </Button>
      </form>
    </div>
  );
};
