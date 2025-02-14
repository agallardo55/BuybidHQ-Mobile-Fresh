
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserFormData } from "@/types/users";

export const useUsersMutations = () => {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const { error } = await supabase
        .from('buybidhq_users')
        .insert([{
          email: userData.email,
          full_name: userData.fullName,
          role: userData.role,
          mobile_number: userData.mobileNumber || null,
          address: userData.address || null,
          city: userData.city || null,
          state: userData.state || null,
          zip_code: userData.zipCode || null,
          dealership_id: userData.dealershipId || null,
          is_active: userData.isActive
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: UserFormData }) => {
      if (!userId) {
        throw new Error('User ID is required for update');
      }

      const { error } = await supabase
        .from('buybidhq_users')
        .update({
          email: userData.email,
          full_name: userData.fullName,
          role: userData.role,
          mobile_number: userData.mobileNumber || null,
          address: userData.address || null,
          city: userData.city || null,
          state: userData.state || null,
          zip_code: userData.zipCode || null,
          dealership_id: userData.dealershipId || null,
          is_active: userData.isActive
        })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  const deleteUser = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      if (!userId) {
        throw new Error('User ID is required for deletion');
      }

      const { error } = await supabase
        .rpc('handle_user_deletion', { 
          user_id: userId, 
          deleted_by_id: (await supabase.auth.getUser()).data.user?.id,
          deletion_reason: reason || null 
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  return {
    createUser,
    updateUser,
    deleteUser,
  };
};
