import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const SubscriptionSection = () => {
  const [selectedPlan, setSelectedPlan] = useState("free");

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
    if (value === "connect") {
      toast.info("Connect plan selected. Upgrade functionality coming soon.");
    }
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
          Choose your subscription plan and manage your account.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Selection */}
        <div className="space-y-4">
          <h3 className="font-medium">Select Your Plan</h3>
          <RadioGroup value={selectedPlan} onValueChange={handlePlanChange} className="space-y-4">
            {/* Free Plan */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="free" id="free-plan" />
              <Label htmlFor="free-plan" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Free Plan</span>
                      <Badge variant="secondary">Current</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Basic features with limited access
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">$0</span>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>
              </Label>
            </div>

            {/* Connect Plan */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="connect" id="connect-plan" />
              <Label htmlFor="connect-plan" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Connect Plan</span>
                      <Badge variant="outline">Upgrade</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enhanced features with full access
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">$29</span>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Account Actions */}
        <div className="border-t pt-4">
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