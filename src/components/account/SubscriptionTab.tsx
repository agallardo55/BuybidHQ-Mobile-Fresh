
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
      if (!currentUser?.id) return null;
      
      // Show limits for basic users and free plan users
      const shouldShowLimits = currentUser.role === 'basic' || account?.plan === 'free';
      if (!shouldShowLimits) return null;
      
      const { data, error } = await supabase.rpc('can_create_bid_request', {
        user_id: currentUser.id
      });
      
      if (error) {
        console.error('Error fetching bid request limits:', error);
        throw error;
      }
      
      console.info('Bid request limits response:', data);
      return data as unknown as BidRequestLimits;
    },
    enabled: !!currentUser?.id && (currentUser?.role === 'basic' || account?.plan === 'free'),
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
      description: '10 buybids per month',
      price: '$0',
      period: '/mo',
    },
    {
      id: 'connect',
      name: 'Connect Plan',
      description: 'Unlimited buybids monthly',
      price: '$99',
      period: '/mo',
    },
    {
      id: 'annual',
      name: 'Annual Plan',
      description: 'Best value - unlimited buybids',
      price: '$599',
      period: '/yr',
      badge: 'Limited Time Offer',
      note: 'Less than $50 per mo.',
    },
    {
      id: 'dealership',
      name: 'Dealership Plan',
      description: 'Multi-user access & analytics',
      price: 'Custom',
      period: '/month',
      isCustom: true,
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
            {/* Show bid request limits only for free plan users */}
            {account?.plan === 'free' && currentUser?.app_role !== 'super_admin' && currentUser?.app_role !== 'account_admin' && bidRequestLimits && (
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
        <div className="space-y-3">
          {mainPlans
            .filter(plan => {
              // Only show dealership plan to super_admin and account_admin
              if (plan.id === 'dealership') {
                return currentUser?.app_role === 'super_admin' || currentUser?.app_role === 'account_admin';
              }
              return true;
            })
            .map((plan) => (
            <div key={plan.id} className={`flex items-center justify-between p-4 border rounded-lg ${plan.id === 'annual' ? 'border-accent bg-accent/5' : 'border-border'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{plan.name}</h4>
                  {plan.badge && (
                    <span className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                  {plan.note && (
                    <span className="ml-2 text-xs text-accent font-medium">• {plan.note}</span>
                  )}
                </div>
              </div>
              <div className="ml-4">
                {(currentUser?.app_role === 'super_admin' || currentUser?.app_role === 'account_admin') ? (
                  <Button disabled variant="outline" className="bg-gray-100 text-gray-500">
                    Admin Access
                  </Button>
                ) : account?.plan === plan.id ? (
                  <Button disabled variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">
                    <Check className="h-4 w-4 mr-2" />
                    Current Plan
                  </Button>
                ) : plan.isCustom ? (
                  <Button
                    onClick={() => navigate('/#contact')}
                    className="bg-accent hover:bg-accent/90"
                  >
                    Contact Sales
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgradeSubscription(plan.id as PlanType)}
                    className="bg-accent hover:bg-accent/90"
                  >
                    {plan.id === 'free' ? 'Start Free Trial' : 'Get Started'}
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
