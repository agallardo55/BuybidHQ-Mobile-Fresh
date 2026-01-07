
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/useAccount";
import { Loader2, Check } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanType } from "@/types/accounts";
import { useState, useEffect } from "react";
import { getPlanButtonConfig, type PlanType as PlanTypeFromHelpers } from "@/utils/planHelpers";

export const SubscriptionTab = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { account, isLoading } = useAccount();
  const { currentUser } = useCurrentUser();

  // Bid request limits removed - all plans now have unlimited requests

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

  const handleChangePlan = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
        method: 'POST',
        body: {
          returnUrl: `${window.location.origin}/account`,
        },
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

  const handlePlanChange = async (planType?: PlanType) => {
    try {
      const currentPlan = account?.plan;
      const targetPlan = planType || 'connect';

      console.log('Starting upgrade process:', { currentPlan, targetPlan, account });

      // Allow free plan users to upgrade to connect plan via Stripe checkout
      // Removed the contact sales redirect for connect plan

      // For specific plan upgrades, use Stripe Checkout
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        method: 'POST',
        body: {
          currentPlan,
          selectedPlan: targetPlan,
          successUrl: `${window.location.origin}/account?success=true`,
          cancelUrl: `${window.location.origin}/account?canceled=true`,
        },
      });

      console.log('Stripe checkout response:', { data, error });

      // If the Edge Function returned an error response
      if (error) {
        console.error('Edge Function error:', error);

        // Try to extract the actual error from the Response object
        let errorMessage = 'Edge Function error';

        try {
          const errorContext = (error as any).context;
          console.log('Error context type:', errorContext?.constructor?.name);

          // If context is a Response object, read the body
          if (errorContext && typeof errorContext.json === 'function') {
            const errorBody = await errorContext.json();
            console.error('Error body from server:', errorBody);
            errorMessage = errorBody.details || errorBody.error || error.message;
          } else if (errorContext?.error || errorContext?.details) {
            errorMessage = errorContext.details || errorContext.error;
          } else {
            errorMessage = error.message;
          }
        } catch (parseError) {
          console.error('Failed to parse error context:', parseError);
          errorMessage = error.message;
        }

        throw new Error(errorMessage);
      }

      // If the data contains an error field (from Edge Function's error responses)
      if (data?.error) {
        console.error('Checkout error from server:', data);
        throw new Error(data.details || data.error);
      }

      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned:', data);
        throw new Error('No checkout URL returned from server');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Operation Failed",
        description: error.message || 'Unable to process upgrade request. Please contact support.',
        variant: "destructive",
      });
    }
  };

  const mainPlans = [
    {
      id: 'free',
      name: 'Free Plan',
      description: 'Unlimited bid requests',
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
            .map((plan) => {
              const buttonConfig = getPlanButtonConfig(account?.plan, plan.id);
              
              return (
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
                        onClick={() => handlePlanChange(plan.id as PlanType)}
                        className={buttonConfig.className}
                      >
                        {buttonConfig.text}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Management Section */}
      {account?.stripe_subscription_id && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Subscription Management</h3>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              onClick={handleChangePlan}
              className="w-full sm:w-auto"
            >
              Change Plan
            </Button>
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
              Change your subscription plan or manage payment methods securely through our payment provider.
              Changes will be reflected immediately in your account.
            </p>
          </div>
        </div>
      )}

      <div className="h-8 border-t mt-6"></div>
    </div>
  );
};
