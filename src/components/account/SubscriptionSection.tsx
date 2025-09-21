import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const SubscriptionSection = () => {
  const handleConnectAccount = () => {
    toast.info("Connect account functionality coming soon");
  };

  const handleCancelAccount = () => {
    toast.error("Account cancellation requested. Please contact support to proceed.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Management
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage your account subscription and billing preferences.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Account Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <h3 className="font-medium">Current Plan</h3>
            <p className="text-sm text-muted-foreground">You are on the free account plan</p>
          </div>
          <Badge variant="secondary">Free Account</Badge>
        </div>

        {/* Account Actions */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleConnectAccount}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Connect Account
          </Button>
          
          <Button 
            variant="destructive" 
            className="w-full justify-start"
            onClick={handleCancelAccount}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Cancel Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};