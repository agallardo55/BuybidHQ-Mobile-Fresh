import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Account, BidRequestLimit } from "@/types/accounts";

export const useAccount = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: account, isLoading } = useQuery({
    queryKey: ['account'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Get user's account through buybidhq_users
      const { data: userData, error: userError } = await supabase
        .from('buybidhq_users')
        .select('account_id')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      if (!userData?.account_id) throw new Error('No account found');

      // Get account details
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', userData.account_id)
        .single();

      if (accountError) throw accountError;

      return account as Account;
    },
  });

  const updateAccount = useMutation({
    mutationFn: async (updatedData: Partial<Account>) => {
      if (!account) throw new Error('No account to update');

      const { data, error } = await supabase
        .from('accounts')
        .update(updatedData)
        .eq('id', account.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account'] });
      toast({
        title: "Success",
        description: "Account updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      });
    },
  });

  return {
    account,
    isLoading,
    updateAccount: updateAccount.mutate,
  };
};

// Hook to check bid request limits
export const useBidRequestLimit = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bid-request-limit'],
    queryFn: async (): Promise<BidRequestLimit> => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('can_create_bid_request', {
        user_id: user.id
      });

      if (error) throw error;
      
      // Safely parse the JSON response
      if (data && typeof data === 'object' && 'allowed' in data) {
        return data as unknown as BidRequestLimit;
      }
      
      // Fallback for unexpected response format
      return { allowed: true };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};