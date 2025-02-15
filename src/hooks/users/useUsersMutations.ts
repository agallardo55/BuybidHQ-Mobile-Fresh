
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeleteUserParams, UpdateUserParams, CreateUserParams } from "./types";
import { transformFormUser } from "@/types/users";

export const useUsersMutations = () => {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: async ({ userData, dealershipData }: CreateUserParams) => {
      // If it's a dealer, create dealership first
      let dealershipId = null;
      if (dealershipData) {
        const { data: dealership, error: dealershipError } = await supabase
          .from('dealerships')
          .insert({
            dealer_name: dealershipData.dealerName,
            dealer_id: dealershipData.dealerId,
            business_phone: dealershipData.businessPhone,
            business_email: dealershipData.businessEmail,
            address: dealershipData.address,
            city: dealershipData.city,
            state: dealershipData.state,
            zip_code: dealershipData.zipCode
          })
          .select()
          .single();

        if (dealershipError) throw dealershipError;
        dealershipId = dealership.id;
      }

      // First check if user with this email already exists
      const normalizedEmail = userData.email.toLowerCase().trim();
      const { data: existingUser, error: fetchError } = await supabase
        .from('buybidhq_users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (fetchError) throw fetchError;

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
      // If it's a dealer, update/create dealership
      if (userData.role === 'dealer' && dealershipData) {
        const { error: dealershipError } = await supabase
          .from('dealerships')
          .upsert({
            id: userData.dealershipId,
            dealer_name: dealershipData.dealerName,
            dealer_id: dealershipData.dealerId,
            business_phone: dealershipData.businessPhone,
            business_email: dealershipData.businessEmail,
            address: dealershipData.address,
            city: dealershipData.city,
            state: dealershipData.state,
            zip_code: dealershipData.zipCode
          });

        if (dealershipError) throw dealershipError;
      }

      // Update user
      const transformedUser = transformFormUser(userData);
      const { data: user, error: userError } = await supabase
        .from('buybidhq_users')
        .update({
          ...transformedUser,
          email: userData.email // Ensure email is explicitly set as it's required
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
