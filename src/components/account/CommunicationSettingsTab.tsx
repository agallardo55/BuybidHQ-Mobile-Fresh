import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Mail, MessageSquare, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const CommunicationSettingsTab = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [emailEnabled, setEmailEnabled] = useState(
    currentUser?.bid_request_email_enabled ?? true
  );
  const [smsEnabled, setSmsEnabled] = useState(
    currentUser?.bid_request_sms_enabled ?? false
  );

  const handleSave = async () => {
    if (!currentUser?.id) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("buybidhq_users")
        .update({
          bid_request_email_enabled: emailEnabled,
          bid_request_sms_enabled: smsEnabled,
        })
        .eq("id", currentUser.id);

      if (error) throw error;
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive bid request notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-base font-medium">
                  Email Notifications
                </Label>
                <Switch
                  id="email-notifications"
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Receive bid request notifications via email. This includes new bids, responses, and updates.
              </p>
            </div>
          </div>

          <Separator />

          {/* SMS Notifications */}
          <div className="flex items-start space-x-3">
            <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notifications" className="text-base font-medium">
                  SMS Notifications
                </Label>
                <Switch
                  id="sms-notifications"
                  checked={smsEnabled}
                  onCheckedChange={setSmsEnabled}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Receive bid request notifications via SMS to your mobile number. 
                {!currentUser?.mobile_number && (
                  <span className="text-destructive">
                    {" "}You need to add a mobile number in your personal information to enable SMS notifications.
                  </span>
                )}
              </p>
            </div>
          </div>

          <Separator />

          <div className="pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || (!smsEnabled && !emailEnabled)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
            
            {!smsEnabled && !emailEnabled && (
              <p className="text-sm text-destructive mt-2">
                At least one notification method must be enabled.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Email notifications are sent instantly when bid responses are received.</p>
          <p>• SMS notifications require a verified mobile number.</p>
          <p>• You can change these preferences at any time.</p>
          <p>• Critical account notifications will still be sent via email regardless of these settings.</p>
        </CardContent>
      </Card>
    </div>
  );
};