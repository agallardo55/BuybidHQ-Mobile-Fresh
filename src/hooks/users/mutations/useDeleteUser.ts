
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/notificationToast";
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
        console.warn('Partial deletion - database deleted, auth user not found:', data.warning);
        // This is actually okay - the user was removed from the database
        // The auth user may not have been fully created (incomplete signup)
        return { success: true, warning: data.warning };
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
