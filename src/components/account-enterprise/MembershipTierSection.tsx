import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, Loader2 } from "lucide-react";
import { UserData } from "@/hooks/useCurrentUser";
import type { Account } from "@/types/accounts";
import { getPlanButtonConfig } from "@/utils/planHelpers";

interface MembershipTierSectionProps {
  account: Account | null | undefined;
  user: UserData | null | undefined;
}

export const MembershipTierSection = ({ account, user }: MembershipTierSectionProps) => {
  const { toast } = useToast();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const currentPlan = account?.plan || 'free';
  const isAdmin = user?.app_role === 'super_admin' || user?.app_role === 'account_admin';

  const handlePlanUpgrade = async (targetPlan: string) => {
    setProcessingPlan(targetPlan);

    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        method: 'POST',
        body: {
          currentPlan,
          selectedPlan: targetPlan,
          successUrl: `${window.location.origin}/account?success=true`,
          cancelUrl: `${window.location.origin}/account?canceled=true`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Operation Failed",
        description: error.message || "Unable to process upgrade request",
        variant: "destructive",
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setProcessingPlan('manage');

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
    } catch (error: any) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Operation Failed",
        description: "Unable to access subscription management",
        variant: "destructive",
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'BETA',
      subtitle: 'BASIC TIER',
      price: '$0',
      period: 'PER MONTH',
      features: [
        'Unlimited bid requests',
        'Buybid dashboard access',
        'Buyers dashboard access',
        'Email support',
      ],
    },
    {
      id: 'connect',
      name: 'CONNECT PREMIUM',
      subtitle: 'PROFESSIONAL TIER',
      price: '$99',
      period: 'PER MONTH',
      features: [
        'All Beta features',
        'Market View access',
        'All future features',
        'Lifetime price lock',
        'Priority support',
      ],
      recommended: true,
    },
    {
      id: 'annual',
      name: 'ANNUAL',
      subtitle: 'ANNUAL TIER',
      price: '$599',
      period: 'PER YEAR',
      features: [
        'All Connect Premium features',
        'Best value - $50/month',
        'Annual billing discount',
        'Lifetime price lock',
        'Priority support',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">MEMBERSHIP TIER</h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 mt-2">
          SUBSCRIPTION MANAGEMENT
        </p>
      </div>

      {/* Current Status */}
      <Card className="border-slate-200 shadow-none">
        <div className="p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">
            CURRENT STATUS
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {isAdmin ? 'ADMINISTRATOR ACCESS' :
                 currentPlan === 'free' ? 'BETA TIER' :
                 currentPlan === 'connect' ? 'CONNECT PREMIUM TIER' :
                 currentPlan === 'annual' ? 'ANNUAL TIER' : 'BETA TIER'}
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
                STATUS: {account?.billing_status?.toUpperCase() || 'ACTIVE'}
              </p>
            </div>
            {account?.stripe_subscription_id && !isAdmin && (
              <Button
                onClick={handleManageSubscription}
                disabled={processingPlan === 'manage'}
                variant="outline"
                className="border-slate-200 text-slate-900 hover:bg-slate-100 h-9 px-4 text-xs font-medium uppercase tracking-widest"
              >
                {processingPlan === 'manage' ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    PROCESSING
                  </>
                ) : (
                  'MANAGE BILLING'
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Pricing Grid */}
      <Card className="border-slate-200 shadow-none overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-slate-200">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentPlan === plan.id;
            const isProcessing = processingPlan === plan.id;

            return (
              <div key={plan.id} className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                    {plan.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">
                    {plan.subtitle}
                  </p>
                  {plan.recommended && (
                    <div className="mt-3">
                      <span className="inline-block bg-slate-900 text-white px-3 py-1 rounded text-[10px] font-medium uppercase tracking-widest">
                        RECOMMENDED
                      </span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="text-center mb-6 pb-6 border-b border-slate-200">
                  <div className="text-3xl font-bold text-slate-900">{plan.price}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">
                    {plan.period}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-slate-900 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <div>
                  {isAdmin ? (
                    <Button
                      disabled
                      className="w-full bg-slate-100 text-slate-500 h-9 px-4 text-xs font-medium uppercase tracking-widest cursor-not-allowed"
                    >
                      ADMIN ACCESS
                    </Button>
                  ) : isCurrentPlan ? (
                    <Button
                      disabled
                      className="w-full bg-green-50 text-green-700 border border-green-200 h-9 px-4 text-xs font-medium uppercase tracking-widest cursor-default hover:bg-green-50"
                    >
                      <Check className="mr-2 h-3 w-3" />
                      ACTIVE TIER
                    </Button>
                  ) : (() => {
                      const buttonConfig = getPlanButtonConfig(currentPlan, plan.id);
                      return (
                        <Button
                          onClick={() => handlePlanUpgrade(plan.id)}
                          disabled={isProcessing}
                          className={`w-full h-9 px-4 text-xs font-medium uppercase tracking-widest ${
                            buttonConfig.isDowngrade
                              ? 'bg-orange-500 hover:bg-orange-600 text-white'
                              : 'bg-brand hover:bg-brand/90 text-white'
                          }`}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              PROCESSING
                            </>
                          ) : (
                            buttonConfig.text.toUpperCase()
                          )}
                        </Button>
                      );
                    })()}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Additional Info */}
      <div className="text-xs text-slate-500 space-y-2">
        <p className="uppercase tracking-wide">
          • ALL PLANS INCLUDE UNLIMITED BID REQUESTS
        </p>
        <p className="uppercase tracking-wide">
          • CANCEL OR MODIFY SUBSCRIPTION AT ANY TIME
        </p>
        <p className="uppercase tracking-wide">
          • SECURE PAYMENT PROCESSING VIA STRIPE
        </p>
      </div>
    </div>
  );
};
