
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserFormData, DealershipFormData } from "@/types/users";
import { toast } from "sonner";
import { useCurrentUser } from "../useCurrentUser";

export const useUsersMutations = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  const createUserMutation = useMutation({
    mutationFn: async (params: { userData: UserFormData; dealershipData?: DealershipFormData }) => {
      const { userData, dealershipData } = params;
      
      if (currentUser?.role === 'dealer' && !['basic', 'individual'].includes(userData.role)) {
        throw new Error("Dealers can only create basic or individual users");
      }

      let dealershipId = currentUser?.role === 'dealer' ? currentUser.dealership_id : userData.dealershipId;

      // If this is a dealer user and we have dealership data, create the dealership first
      if (userData.role === 'dealer' && dealershipData) {
        const { data: newDealership, error: dealershipError } = await supabase
          .from('dealerships')
          .insert({
            dealer_name: dealershipData.dealerName,
            business_phone: dealershipData.businessPhone,
            business_email: dealershipData.businessEmail,
            address: dealershipData.address,
            city: dealershipData.city,
            state: dealershipData.state,
            zip_code: dealershipData.zipCode,
            dealer_id: dealershipData.dealerId
          })
          .select()
          .single();

        if (dealershipError) throw dealershipError;
        dealershipId = newDealership.id;
      }

      // First create the auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        email_confirm: true,
        user_metadata: {
          full_name: userData.fullName,
          role: userData.role
        }
      });

      if (authError) throw authError;

      // Wait a moment for the trigger to create the user record
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the buybidhq_users record with additional information
      const { data, error } = await supabase
        .from('buybidhq_users')
        .update({
          full_name: userData.fullName,
          role: userData.role,
          mobile_number: userData.mobileNumber,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          zip_code: userData.zipCode,
          dealership_id: dealershipId,
          is_active: userData.isActive,
          status: 'active'
        })
        .eq('id', authUser.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add user: " + error.message);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: UserFormData }) => {
      if (!currentUser) throw new Error("Not authenticated");

      const { data: canManage } = await supabase
        .rpc('can_manage_user', {
          manager_id: currentUser.id,
          target_user_id: userId
        });

      if (!canManage) {
        throw new Error("You don't have permission to update this user");
      }

      const { data, error } = await supabase
        .from('buybidhq_users')
        .update({
          full_name: userData.fullName,
          email: userData.email,
          role: userData.role,
          mobile_number: userData.mobileNumber,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          zip_code: userData.zipCode,
          dealership_id: currentUser?.role === 'dealer' ? currentUser.dealership_id : userData.dealershipId,
          is_active: userData.isActive
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update user: " + error.message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      if (!currentUser) throw new Error("Not authenticated");

      const { error } = await supabase
        .rpc('handle_user_deletion', {
          user_id: userId,
          deleted_by_id: currentUser.id,
          deletion_reason: reason || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete user: " + error.message);
    },
  });

  return {
    createUser: (userData: UserFormData, dealershipData?: DealershipFormData) => 
      createUserMutation.mutate({ userData, dealershipData }),
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
  };
};
