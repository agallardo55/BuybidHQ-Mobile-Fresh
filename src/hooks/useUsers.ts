
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserFormData } from "@/types/users";
import { toast } from "sonner";
import { useCurrentUser } from "./useCurrentUser";

export const useUsers = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buybidhq_users')
        .select('*, dealerships:dealership_id(*)');

      if (error) {
        toast.error("Failed to fetch users: " + error.message);
        throw error;
      }

      return data.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        status: user.status || 'active',
        mobileNumber: user.mobile_number,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zip_code,
        dealershipId: user.dealership_id,
        dealershipName: user.dealerships?.dealer_name,
        isActive: user.is_active
      }));
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      // Validate role assignment based on current user's role
      if (currentUser?.role === 'dealer' && !['basic', 'individual'].includes(userData.role)) {
        throw new Error("Dealers can only create basic or individual users");
      }

      const insertData = {
        full_name: userData.fullName,
        email: userData.email,
        role: userData.role,
        mobile_number: userData.mobileNumber,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        zip_code: userData.zipCode,
        dealership_id: currentUser?.role === 'dealer' ? currentUser.dealership_id : userData.dealershipId,
        is_active: userData.isActive,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('buybidhq_users')
        .insert(insertData)
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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Check if the user exists and get their role
      const { data: userToDelete, error: fetchError } = await supabase
        .from('buybidhq_users')
        .select('role, dealership_id')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Validate deletion permissions
      if (currentUser?.role === 'dealer') {
        if (!['basic', 'individual'].includes(userToDelete.role)) {
          throw new Error("Dealers can only delete basic or individual users");
        }
        if (userToDelete.dealership_id !== currentUser.dealership_id) {
          throw new Error("You can only delete users from your dealership");
        }
      }

      const { error } = await supabase
        .from('buybidhq_users')
        .delete()
        .eq('id', userId);

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
    users,
    isLoading,
    createUser: createUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
  };
};
