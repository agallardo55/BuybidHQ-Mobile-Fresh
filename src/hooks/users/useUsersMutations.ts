
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserFormData, DealershipFormData } from "@/types/users";

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
    mutationFn: async ({ 
      userId, 
      userData, 
      dealershipData 
    }: { 
      userId: string; 
      userData: UserFormData; 
      dealershipData?: DealershipFormData;
    }) => {
      // Validate userId
      if (!userId?.trim()) {
        throw new Error('User ID is required for update');
      }

      // If role is not dealer, ensure dealership data is cleared
      if (userData.role !== 'dealer') {
        const { error: clearDealershipError } = await supabase
          .from('buybidhq_users')
          .update({
            dealership_id: null
          })
          .eq('id', userId);

        if (clearDealershipError) throw clearDealershipError;
        
        // Update user without dealership data
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
            is_active: userData.isActive
          })
          .eq('id', userId);

        if (error) throw error;
        return;
      }

      // Handle dealer role with dealership data
      if (userData.role === 'dealer' && dealershipData) {
        let dealershipId = userData.dealershipId;

        if (dealershipId) {
          // Update existing dealership
          const { error: dealershipError } = await supabase
            .from('dealerships')
            .update({
              dealer_name: dealershipData.dealerName,
              business_phone: dealershipData.businessPhone,
              business_email: dealershipData.businessEmail,
              dealer_id: dealershipData.dealerId,
              address: dealershipData.address,
              city: dealershipData.city,
              state: dealershipData.state,
              zip_code: dealershipData.zipCode
            })
            .eq('id', dealershipId);

          if (dealershipError) throw dealershipError;
        } else {
          // Create new dealership
          const { data: newDealership, error: dealershipError } = await supabase
            .from('dealerships')
            .insert({
              dealer_name: dealershipData.dealerName,
              business_phone: dealershipData.businessPhone,
              business_email: dealershipData.businessEmail,
              dealer_id: dealershipData.dealerId,
              address: dealershipData.address,
              city: dealershipData.city,
              state: dealershipData.state,
              zip_code: dealershipData.zipCode
            })
            .select('id')
            .single();

          if (dealershipError) throw dealershipError;
          dealershipId = newDealership.id;
        }

        // Update user with dealership data
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
            dealership_id: dealershipId,
            is_active: userData.isActive
          })
          .eq('id', userId);

        if (error) throw error;
      }
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
      if (!userId?.trim()) {
        throw new Error('User ID is required for deletion');
      }

      const { data: currentUser, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!currentUser.user?.id) {
        throw new Error('Current user not found');
      }

      const { error } = await supabase
        .rpc('handle_user_deletion', { 
          user_id: userId, 
          deleted_by_id: currentUser.user.id,
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
