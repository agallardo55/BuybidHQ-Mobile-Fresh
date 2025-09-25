
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

      // Remove account admin status if this user was an account admin
      const { error: removeAdminError } = await supabase
        .from('account_administrators')
        .update({ status: 'inactive' })
        .eq('user_id', userId);

      if (removeAdminError) {
        console.error('Remove admin error:', removeAdminError);
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
