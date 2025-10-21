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
    currentUser?.bid_request_email_enabled ?? false
  );
  const [smsEnabled, setSmsEnabled] = useState(
    currentUser?.bid_request_sms_enabled ?? true
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

      toast({
        title: "Success",
        description: "Communication preferences updated successfully.",
      });
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
            Communication Settings
          </CardTitle>
          <CardDescription>
            Choose how you want to send bid requests to buyers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-start space-x-3 opacity-50">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-base font-medium text-muted-foreground">
                  Send via Email
                </Label>
                <Switch
                  id="email-notifications"
                  checked={false}
                  disabled={true}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Send bid requests to buyers via email. This includes new bid requests and updates.
                <span className="block mt-1 text-xs text-orange-600 font-medium">
                  Coming soon - Email feature is currently in development
                </span>
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
                  Send via SMS
                </Label>
                <Switch
                  id="sms-notifications"
                  checked={smsEnabled}
                  onCheckedChange={setSmsEnabled}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Send bid requests to buyers via SMS to their mobile numbers. 
                {!currentUser?.mobile_number && (
                  <span className="text-destructive">
                    {" "}You need to add a mobile number in your personal information to enable SMS sending.
                  </span>
                )}
              </p>
            </div>
          </div>

          <Separator />

          <div className="pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !smsEnabled}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
            
            {!smsEnabled && (
              <p className="text-sm text-destructive mt-2">
                SMS sending must be enabled.
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
          <p>• Bid requests are sent instantly to selected buyers.</p>
          <p>• SMS sending requires valid mobile numbers for buyers.</p>
          <p>• You can change these preferences at any time.</p>
          <p>• Account notifications will still be sent via email regardless of these settings.</p>
        </CardContent>
      </Card>
    </div>
  );
};