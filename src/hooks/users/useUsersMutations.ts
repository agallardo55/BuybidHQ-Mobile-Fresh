
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeleteUserParams, UpdateUserParams, CreateUserParams } from "./types";
import { transformFormUser } from "@/types/users";

export const useUsersMutations = () => {
  const queryClient = useQueryClient();

  const createUser = useMutation({
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
          // Only set primary_user_id if this is a primary dealer
          ...(userData.isPrimaryDealer && { primary_user_id: existingUser?.id })
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
        
        const { data: authUser, error: signUpError } = await supabase.auth.signUp({
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
          email: normalizedEmail
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
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

  const updateUser = useMutation({
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

  const deleteUser = useMutation({
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

  return {
    createUser,
    updateUser,
    deleteUser
  };
};
