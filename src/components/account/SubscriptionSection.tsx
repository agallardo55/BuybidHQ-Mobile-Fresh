import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAccount, useBidRequestLimit } from "@/hooks/useAccount";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { PLAN_INFO, type PlanType } from "@/types/accounts";

export const SubscriptionSection = () => {
  const { account, isLoading: accountLoading } = useAccount();
  const { data: bidLimit } = useBidRequestLimit();
  const { currentUser } = useCurrentUser();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(account?.plan || "free");
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value as PlanType);
  };

  const handleUpgrade = async () => {
    if (!account || selectedPlan === account.plan) return;
    
    setIsUpgrading(true);
    try {
      if (selectedPlan === "connect") {
        // Create Stripe checkout session
        const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
          body: {
            currentPlan: account.plan,
            successUrl: `${window.location.origin}/account?success=true`,
            cancelUrl: `${window.location.origin}/account?canceled=true`,
          }
        });

        if (error) throw error;
        
        if (data?.url) {
          window.location.href = data.url;
        }
      } else if (selectedPlan === "group") {
        toast({
          title: "Group Plan",
          description: "Contact sales to set up your Group plan with multi-user management.",
        });
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast({
        title: "Error",
        description: "Failed to start upgrade process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
        body: {
          returnUrl: window.location.href
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelAccount = () => {
    toast({
      title: "Account Cancellation",
      description: "Please contact support to cancel your account.",
    });
  };

  if (accountLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Loading subscription details...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentPlan = account?.plan || 'free';
  const planInfo = PLAN_INFO[currentPlan];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Plan</CardTitle>
        <CardDescription>
          Manage your subscription and billing preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Plan</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">{planInfo.name} Plan</h4>
              <p className="text-sm text-muted-foreground">
                {planInfo.description}
              </p>
              {currentPlan === 'free' && bidLimit && (
                <p className="text-sm text-muted-foreground mt-1">
                  {bidLimit.remaining !== undefined ? 
                    `${bidLimit.remaining} requests remaining this month` : 
                    'Loading usage...'
                  }
                </p>
              )}
            </div>
            <div className="text-right">
              <Badge variant="secondary">Current</Badge>
              {account?.billing_status === 'past_due' && (
                <Badge variant="destructive" className="ml-2">Past Due</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Available Plans</h3>
          <RadioGroup value={selectedPlan} onValueChange={handlePlanChange}>
            {/* Free Plan */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="free" id="free" />
                <div>
                  <Label htmlFor="free" className="font-medium">Free Plan</Label>
                  <p className="text-sm text-muted-foreground">
                    {PLAN_INFO.free.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold">$0</span>
                <p className="text-xs text-muted-foreground">per month</p>
                {currentPlan === "free" && <Badge variant="secondary" className="mt-1">Current</Badge>}
              </div>
            </div>

            {/* Connect Plan */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="connect" id="connect" />
                <div>
                  <Label htmlFor="connect" className="font-medium">Connect Plan</Label>
                  <p className="text-sm text-muted-foreground">
                    {PLAN_INFO.connect.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold">${PLAN_INFO.connect.price}</span>
                <p className="text-xs text-muted-foreground">per month</p>
                {currentPlan === "connect" && <Badge variant="secondary" className="mt-1">Current</Badge>}
              </div>
            </div>

            {/* Group Plan (if feature enabled or super admin) */}
            {(account?.feature_group_enabled || currentUser?.app_role === 'super_admin') && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="group" id="group" />
                  <div>
                    <Label htmlFor="group" className="font-medium">Group Plan</Label>
                    <p className="text-sm text-muted-foreground">
                      {PLAN_INFO.group.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold">Custom</span>
                  <p className="text-xs text-muted-foreground">contact sales</p>
                  {currentPlan === "group" && <Badge variant="secondary" className="mt-1">Current</Badge>}
                </div>
              </div>
            )}
          </RadioGroup>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {selectedPlan !== currentPlan && (
            <Button 
              onClick={handleUpgrade} 
              disabled={isUpgrading}
              className="flex-1"
            >
              {isUpgrading ? 'Processing...' : `Upgrade to ${PLAN_INFO[selectedPlan as keyof typeof PLAN_INFO].name}`}
            </Button>
          )}
          
          {account?.stripe_customer_id && (
            <Button variant="outline" onClick={handleManageSubscription} className="flex-1">
              Manage Payment Methods
            </Button>
          )}
        </div>

        {/* Limit Reached Banner for Free Users */}
        {currentPlan === 'free' && bidLimit && !bidLimit.allowed && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800">Limit Reached</h4>
            <p className="text-sm text-yellow-700 mt-1">
              You've used all 10 free bid requests this month. Upgrade to Connect for unlimited requests.
            </p>
            <Button 
              size="sm" 
              className="mt-2"
              onClick={() => {
                setSelectedPlan('connect');
                handleUpgrade();
              }}
            >
              Upgrade to Connect
            </Button>
          </div>
        )}

        {/* Cancel Account */}
        <div className="pt-4 border-t">
          <Button variant="destructive" onClick={handleCancelAccount} className="w-full">
            Cancel Account
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This will permanently delete your account and all associated data
          </p>
        </div>
      </CardContent>
    </Card>
  );
};