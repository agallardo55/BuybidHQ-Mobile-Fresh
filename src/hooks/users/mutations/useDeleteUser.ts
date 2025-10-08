
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeleteUserParams } from "../types";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }: DeleteUserParams) => {
      // Call the secure Edge Function that handles:
      // 1. Superadmin validation
      // 2. Soft delete in buybidhq_users (via handle_user_deletion DB function)
      // 3. Insert into deleted_users
      // 4. Update account_administrators
      // 5. Delete from auth.users
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId, reason }
      });

      if (error) {
        console.error('Delete user error:', error);
        throw new Error(error.message || 'Failed to delete user');
      }

      // Handle partial success (database deleted but auth failed)
      if (data?.partial_success) {
        console.warn('Partial deletion:', data.warning);
        throw new Error(data.warning);
      }

      return data;
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
