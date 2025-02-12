
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
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to load subscription details');
        throw error;
      }

      return subscription as Subscription;
    },
  });

  const updateSubscription = useMutation({
    mutationFn: async (updatedData: Partial<Subscription>) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updatedData)
        .eq('id', subscription?.id)
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
