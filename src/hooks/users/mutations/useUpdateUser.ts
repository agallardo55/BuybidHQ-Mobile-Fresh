
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UpdateUserParams } from "../types";
import { transformFormUser } from "@/types/users";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userData, dealershipData }: UpdateUserParams) => {
      let dealershipId = userData.dealershipId;

      // Handle dealership data if provided
      if (dealershipData) {
        const dealershipUpdate = {
          dealer_name: dealershipData.dealerName,
          dealer_id: dealershipData.dealerId,
          business_phone: dealershipData.businessPhone,
          business_email: dealershipData.businessEmail,
          address: dealershipData.address,
          city: dealershipData.city,
          state: dealershipData.state,
          zip_code: dealershipData.zipCode,
          // Update primary_user_id if applicable
          ...(userData.isPrimaryDealer && { primary_user_id: userId })
        };

        if (dealershipId) {
          // Update existing dealership
          const { error: updateError } = await supabase
            .from('dealerships')
            .update(dealershipUpdate)
            .eq('id', dealershipId);

          if (updateError) throw updateError;
        } else {
          // Create new dealership
          const { data: newDealership, error: createError } = await supabase
            .from('dealerships')
            .insert(dealershipUpdate)
            .select()
            .single();

          if (createError) throw createError;
          dealershipId = newDealership.id;
        }

        // If this user is no longer the primary dealer, remove their primary_user_id
        if (!userData.isPrimaryDealer) {
          const { error: clearPrimaryError } = await supabase
            .from('dealerships')
            .update({ primary_user_id: null })
            .eq('primary_user_id', userId);

          if (clearPrimaryError) throw clearPrimaryError;
        }
      }

      // Update user
      const transformedUser = transformFormUser(userData);
      const { data: user, error: userError } = await supabase
        .from('buybidhq_users')
        .update({
          ...transformedUser,
          dealership_id: dealershipId,
        })
        .eq('id', userId)
        .select()
        .single();

      if (userError) throw userError;
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user: ${error.message}`);
    }
  });
};
