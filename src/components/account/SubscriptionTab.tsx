
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/useAccount";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { PlanType } from "@/types/accounts";

export const SubscriptionTab = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { account, isLoading } = useAccount();
  const { currentUser } = useCurrentUser();

  // Early return for dealer users as a safety measure
  if (currentUser?.role === 'dealer') {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">
          Subscription management is not available for dealer users.
        </p>
      </div>
    );
  }

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
        method: 'POST',
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Error",
        description: "Unable to access subscription management. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleUpgradeSubscription = async () => {
    try {
      const currentPlan = account?.plan;

      // If upgrading from free plan, show contact sales message  
      if (currentPlan === "free") {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          toast({
            title: "Contact Sales",
            description: "Please contact our sales team to upgrade your plan.",
          });
          contactSection.scrollIntoView({ behavior: 'smooth' });
          return;
        } else {
          // If not on homepage, navigate there first
          navigate('/#contact');
          return;
        }
      }

      // For connect plan upgrades, use Stripe Checkout
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        method: 'POST',
        body: {
          currentPlan,
          successUrl: `${window.location.origin}/account?success=true`,
          cancelUrl: `${window.location.origin}/account?canceled=true`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Unable to process upgrade request. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const getCurrentPlanLabel = () => {
    if (!account) return "Loading...";
    
    switch (account.plan) {
      case "free":
        return "Free Plan";
      case "connect":
        return "Connect Plan ($100/month)";
      case "group":
        return "Group Plan (Custom)";
      default:
        return "Select plan";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Current Subscription</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">{getCurrentPlanLabel()}</p>
            <p className="text-sm text-gray-500">
              Status: {account?.billing_status?.charAt(0).toUpperCase() + account?.billing_status?.slice(1)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Button
            type="button"
            onClick={handleUpgradeSubscription}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={account?.plan === 'group'}
          >
            {account?.plan === 'group' ? 'Current Plan' : 'Upgrade Subscription'}
          </Button>
          {account?.stripe_subscription_id && (
            <Button
              type="button"
              onClick={handleManageSubscription}
              variant="outline"
              className="w-full"
            >
              Manage Payment Methods
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-500">
          <p>
            Manage your subscription and payment methods securely through our payment provider.
            Changes will be reflected immediately in your account.
          </p>
        </div>
      </div>
      <div className="h-8 border-t mt-6"></div>
    </div>
  );
};
