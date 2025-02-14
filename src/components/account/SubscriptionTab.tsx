
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const SubscriptionTab = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscription, isLoading } = useSubscription();
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
      const currentPlan = subscription?.plan_type;

      // If upgrading to Dealership plan, redirect to contact form
      if (currentPlan === "beta-access" || currentPlan === "individual") {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          toast({
            title: "Contact Sales",
            description: "Please contact our sales team to upgrade to the Dealership plan.",
          });
          contactSection.scrollIntoView({ behavior: 'smooth' });
          return;
        } else {
          // If not on homepage, navigate there first
          navigate('/#contact');
          return;
        }
      }

      // For Individual plan upgrades, use Stripe Checkout
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        method: 'POST',
        body: {
          currentPlan,
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
    if (!subscription) return "Loading...";
    
    switch (subscription.plan_type) {
      case "beta-access":
        return "Beta Access (Free)";
      case "individual":
        return "Individual ($49/month)";
      case "dealership":
        return "Dealership (Custom)";
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
              Status: {subscription?.status.charAt(0).toUpperCase() + subscription?.status.slice(1)}
            </p>
          </div>
          {subscription?.current_period_end && (
            <p className="text-sm text-gray-500">
              Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Button
            type="button"
            onClick={handleUpgradeSubscription}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={subscription?.plan_type === 'dealership'}
          >
            {subscription?.plan_type === 'dealership' ? 'Current Plan' : 'Upgrade Subscription'}
          </Button>
          {subscription?.stripe_subscription_id && (
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
