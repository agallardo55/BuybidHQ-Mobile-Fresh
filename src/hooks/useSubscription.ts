
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Subscription {
  id: string;
  plan_type: 'beta-access' | 'individual' | 'dealership';
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

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to load subscription details');
        throw error;
      }

      if (!subscription) {
        return {
          id: '',
          plan_type: 'beta-access' as const,
          status: 'active' as const,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_end: null,
        };
      }

      return subscription as Subscription;
    },
  });

  const updateSubscription = useMutation({
    mutationFn: async (updatedData: Partial<Subscription>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingSub) {
        // When creating a new subscription, ensure required fields are present
        const newSubscription = {
          user_id: user.id,
          plan_type: updatedData.plan_type || 'beta-access',
          status: updatedData.status || 'active',
          ...updatedData,
        };

        const { data, error } = await supabase
          .from('subscriptions')
          .insert(newSubscription)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .update(updatedData)
        .eq('id', existingSub.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription updated successfully');
    },
    onError: (error) => {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    },
  });

  return {
    subscription,
    isLoading,
    updateSubscription: updateSubscription.mutate,
  };
};
