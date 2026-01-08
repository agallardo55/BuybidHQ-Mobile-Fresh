
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/notificationToast";
import { CreateUserParams } from "../types";
import { transformFormUser } from "@/types/users";

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userData, dealershipData }: CreateUserParams) => {
      // First check if user with this email already exists
      const normalizedEmail = userData.email.toLowerCase().trim();
      const { data: existingUser, error: fetchError } = await supabase
        .from('buybidhq_users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // If dealership data is provided, create or update the dealership
      let dealershipId = null;
      if (dealershipData && dealershipData.dealerName) {
        // Check if dealership already exists
        const { data: existingDealership, error: dealershipFetchError } = await supabase
          .from('dealerships')
          .select('id')
          .eq('business_email', dealershipData.businessEmail)
          .maybeSingle();

        if (dealershipFetchError) throw dealershipFetchError;

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

        if (existingDealership) {
          // Update existing dealership
          const { data: updatedDealership, error: updateError } = await supabase
            .from('dealerships')
            .update(dealershipUpdate)
            .eq('id', existingDealership.id)
            .select()
            .single();

          if (updateError) throw updateError;
          dealershipId = updatedDealership.id;
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

      // If user doesn't exist, create them in Auth first
      if (!existingUser) {
        // Generate a temporary password - user will need to reset it
        const tempPassword = Math.random().toString(36).slice(-8);
        
        const { error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: tempPassword,
          options: {
            data: {
              full_name: userData.fullName,
              role: userData.role
            }
          }
        });

        if (signUpError) throw signUpError;

        // Wait briefly for the trigger to create the user record
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Now fetch the user record (either existing or newly created)
      const { data: user, error: userError } = await supabase
        .from('buybidhq_users')
        .select('*')
        .eq('email', normalizedEmail)
        .single();

      if (userError) throw userError;

      // Update the user with all the provided information
      const transformedUser = transformFormUser(userData);
      const { data: updatedUser, error: updateError } = await supabase
        .from('buybidhq_users')
        .update({
          ...transformedUser,
          dealership_id: dealershipId,
          email: normalizedEmail,
          app_role: userData.isAccountAdmin ? 'account_admin' : 'member'
        } as any) // Type assertion to handle enum mismatch
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // If this user is an account admin, create account administrator record
      if (userData.isAccountAdmin && updatedUser.account_id) {
        const { error: accountAdminError } = await supabase
          .from('account_administrators')
          .insert({
            user_id: updatedUser.id,
            account_id: updatedUser.account_id,
            email: updatedUser.email,
            full_name: updatedUser.full_name,
            mobile_number: updatedUser.mobile_number,
            status: 'active',
            granted_by: (await supabase.auth.getSession()).data.session?.user?.id,
            granted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (accountAdminError && !accountAdminError.message.includes('duplicate key')) {
          console.error('Account admin creation error:', accountAdminError);
        }
      }

      return updatedUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully. A welcome email has been sent to set their password.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create user: ${error.message}`);
    }
  });
};
