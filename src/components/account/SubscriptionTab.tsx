
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/useAccount";
import { Loader2, Check } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanType } from "@/types/accounts";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface BidRequestLimits {
  allowed: boolean;
  remaining?: number;
  reason?: string;
}

export const SubscriptionTab = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { account, isLoading } = useAccount();
  const { currentUser } = useCurrentUser();

  // Fetch bid request limits for free users
  const { data: bidRequestLimits } = useQuery({
    queryKey: ['bid-request-limits', currentUser?.id],
    queryFn: async (): Promise<BidRequestLimits | null> => {
      if (!currentUser?.id || account?.plan !== 'free') return null;
      
      const { data, error } = await supabase.rpc('can_create_bid_request', {
        user_id: currentUser.id
      });
      
      if (error) throw error;
      return data as unknown as BidRequestLimits;
    },
    enabled: !!currentUser?.id && account?.plan === 'free',
  });

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

  const mainPlans = [
    {
      id: 'free',
      name: 'Free Plan',
      description: 'Perfect for the individual dealer',
      price: '$0',
      period: '/per user/per mo.',
      features: [
        '10 Buybids per mo.',
        'Unlimited buyer connections',
        'Buybid dashboard'
      ],
    },
    {
      id: 'connect',
      name: 'Buybid Connect',
      description: 'For buyers looking to expand their network',
      price: '$99',
      period: '/per mo.',
      features: [
        'Unlimited Buybids',
        'No monthly commitment',
        'Billed Monthly',
        'Buybid dashboard',
        'All Basic features'
      ],
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
              {currentUser?.app_role === 'super_admin' ? 'Super Admin' :
               currentUser?.app_role === 'account_admin' ? 'Admin' :
               mainPlans.find(p => p.id === account?.plan)?.name || "Free Plan"}
            </p>
            <p className="text-sm text-gray-500">
              Status: {account?.billing_status?.charAt(0).toUpperCase() + account?.billing_status?.slice(1) || 'Active'}
            </p>
            {/* Show bid request limits for free users */}
            {account?.plan === 'free' && bidRequestLimits && (
              <div className="mt-2 space-y-1">
                {bidRequestLimits.allowed ? (
                  <p className="text-sm text-green-600">
                    {bidRequestLimits.remaining !== undefined 
                      ? `${bidRequestLimits.remaining} bid requests remaining this month`
                      : 'Bid requests available'}
                  </p>
                ) : (
                  <p className="text-sm text-red-600">
                    Monthly limit reached (10/10). Upgrade to continue submitting bid requests.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mainPlans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-gray-500">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-accent mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {(currentUser?.app_role === 'super_admin' || currentUser?.app_role === 'account_admin') ? (
                  <Button disabled className="w-full bg-gray-100 text-gray-500">
                    Admin Access
                  </Button>
                ) : account?.plan === plan.id ? (
                  <Button disabled className="w-full bg-green-100 text-green-700 hover:bg-green-100">
                    <Check className="h-4 w-4 mr-2" />
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgradeSubscription(plan.id as PlanType)}
                    className="w-full bg-accent hover:bg-accent/90"
                  >
                    {plan.id === 'connect' ? 'Get Started' : 'Get Started'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Group Plan Contact */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Need multi-user dealership management?{' '}
          <button 
            onClick={() => navigate('/#contact')} 
            className="text-accent hover:text-accent/90 font-medium"
          >
            Contact us about our Group Plan
          </button>
        </p>
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
