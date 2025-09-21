
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Account, PlanType } from "@/types/accounts";

// Legacy interface for backwards compatibility
interface Subscription {
  id: string;
  plan_type: PlanType;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
}

export const useSubscription = () => {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      // Get user's account through buybidhq_users
      const { data: userData, error: userError } = await supabase
        .from('buybidhq_users')
        .select('account_id')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      if (!userData?.account_id) {
        // Return default free subscription for users without accounts
        return {
          id: '',
          plan_type: 'free' as const,
          status: 'active' as const,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_end: null,
        };
      }

      // Get account details
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', userData.account_id)
        .single();

      if (accountError) {
        console.error('Error fetching account:', accountError);
        toast({
          title: "Error",
          description: "Failed to load subscription details",
          variant: "destructive",
        });
        throw accountError;
      }

      // Convert account to subscription format for backwards compatibility
      return {
        id: account.id,
        plan_type: account.plan as PlanType,
        status: account.billing_status === 'active' ? 'active' as const : 'canceled' as const,
        stripe_customer_id: account.stripe_customer_id,
        stripe_subscription_id: account.stripe_subscription_id,
        current_period_end: null, // This would need to be fetched from Stripe if needed
      } as Subscription;
    },
  });

  const updateSubscription = useMutation({
    mutationFn: async (updatedData: Partial<Account>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's account_id
      const { data: userData, error: userError } = await supabase
        .from('buybidhq_users')
        .select('account_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.account_id) throw new Error('No account found');

      const { data, error } = await supabase
        .from('accounts')
        .update(updatedData)
        .eq('id', userData.account_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  return {
    subscription,
    isLoading,
    updateSubscription: updateSubscription.mutate,
  };
};
