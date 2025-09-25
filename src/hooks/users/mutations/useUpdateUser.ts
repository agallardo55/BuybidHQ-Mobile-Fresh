
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
      }

      // Update user
      const transformedUser = transformFormUser(userData);
      const { data: user, error: userError } = await supabase
        .from('buybidhq_users')
        .update({
          ...transformedUser,
          dealership_id: dealershipId,
          app_role: userData.isAccountAdmin ? 'account_admin' : 'member'
        })
        .eq('id', userId)
        .select()
        .single();

      if (userError) throw userError;

      // Handle account admin status
      if (userData.isAccountAdmin && user.account_id) {
        // Create or update account administrator record
        const { error: accountAdminError } = await supabase
          .from('account_administrators')
          .upsert({
            user_id: userId,
            account_id: user.account_id,
            email: user.email,
            full_name: user.full_name,
            mobile_number: user.mobile_number,
            status: 'active',
            granted_by: (await supabase.auth.getSession()).data.session?.user?.id,
            granted_at: new Date().toISOString()
          });

        if (accountAdminError) {
          console.error('Account admin upsert error:', accountAdminError);
        }
      } else {
        // Remove account admin status if unchecked
        const { error: removeAdminError } = await supabase
          .from('account_administrators')
          .update({ status: 'inactive' })
          .eq('user_id', userId);

        if (removeAdminError) {
          console.error('Remove admin error:', removeAdminError);
        }
      }

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
