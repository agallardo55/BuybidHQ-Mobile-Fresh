
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeleteUserParams } from "../types";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }: DeleteUserParams) => {
      // First get the user data
      const { data: user, error: fetchError } = await supabase
        .from('buybidhq_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      // If user is a primary dealer, we need to handle that first
      if (user.role === 'dealer') {
        const { data: dealership, error: dealershipError } = await supabase
          .from('dealerships')
          .select('primary_user_id')
          .eq('primary_user_id', userId)
          .single();

        if (dealershipError && !dealershipError.message.includes('No rows found')) {
          throw dealershipError;
        }

        if (dealership) {
          // Clear the primary_user_id before deleting
          const { error: clearPrimaryError } = await supabase
            .from('dealerships')
            .update({ primary_user_id: null })
            .eq('primary_user_id', userId);

          if (clearPrimaryError) throw clearPrimaryError;
        }
      }

      // Move user to deleted_users table
      const { error: deleteError } = await supabase
        .from('deleted_users')
        .insert({
          ...user,
          deletion_reason: reason,
          deleted_by: (await supabase.auth.getSession()).data.session?.user?.id
        });

      if (deleteError) throw deleteError;

      // Delete user from buybidhq_users
      const { error: userError } = await supabase
        .from('buybidhq_users')
        .delete()
        .eq('id', userId);

      if (userError) throw userError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    }
  });
};
