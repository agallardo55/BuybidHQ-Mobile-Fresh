
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/useAccount";
import { Loader2, Check } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { PlanType } from "@/types/accounts";

export const SubscriptionTab = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { account, isLoading } = useAccount();
  const { currentUser } = useCurrentUser();

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

  const handleUpgradeSubscription = async (planType?: PlanType) => {
    try {
      const currentPlan = account?.plan;
      const targetPlan = planType || 'connect';

      // If upgrading from free plan to connect, show contact sales message  
      if (currentPlan === "free" && targetPlan === "connect") {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
          return;
        } else {
          // If not on homepage, navigate there first
          navigate('/#contact');
          return;
        }
      }

      // For specific plan upgrades, use Stripe Checkout
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        method: 'POST',
        body: {
          currentPlan,
          targetPlan,
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

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0',
      period: 'forever',
      features: [
        'Up to 10 bid requests per month',
        'Basic vehicle information',
        'Email notifications',
        'Community support'
      ],
      buttonText: 'Current Plan',
      popular: false,
    },
    {
      id: 'connect',
      name: 'Connect Plan',
      price: '$100',
      period: 'per month',
      features: [
        'Unlimited bid requests',
        'Advanced vehicle details',
        'SMS & Email notifications',
        'Priority support',
        'Analytics dashboard',
        'API access'
      ],
      buttonText: 'Upgrade to Connect',
      popular: true,
    },
    {
      id: 'group',
      name: 'Group Plan',
      price: 'Custom',
      period: 'pricing',
      features: [
        'Everything in Connect',
        'Multiple user accounts',
        'Advanced permissions',
        'Custom integrations',
        'Dedicated support',
        'Custom branding'
      ],
      buttonText: 'Contact Sales',
      popular: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Current Subscription</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">
              {subscriptionPlans.find(p => p.id === account?.plan)?.name || "Free Plan"}
            </p>
            <p className="text-sm text-gray-500">
              Status: {account?.billing_status?.charAt(0).toUpperCase() + account?.billing_status?.slice(1) || 'Active'}
            </p>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border p-6 ${
                plan.popular
                  ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                  : 'border-gray-200'
              } ${
                account?.plan === plan.id ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h4 className="text-lg font-medium text-gray-900">{plan.name}</h4>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {account?.plan === plan.id ? (
                  <Button
                    disabled
                    className="w-full bg-green-100 text-green-700 hover:bg-green-100"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (plan.id === 'group') {
                        navigate('/#contact');
                      } else {
                        handleUpgradeSubscription(plan.id as PlanType);
                      }
                    }}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-accent hover:bg-accent/90 text-accent-foreground'
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Management Section */}
      {account?.stripe_subscription_id && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Subscription Management</h3>
          <div className="pt-4">
            <Button
              type="button"
              onClick={handleManageSubscription}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Manage Payment Methods
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            <p>
              Manage your subscription and payment methods securely through our payment provider.
              Changes will be reflected immediately in your account.
            </p>
          </div>
        </div>
      )}

      <div className="h-8 border-t mt-6"></div>
    </div>
  );
};
