
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserFormData } from "@/types/users";
import { toast } from "sonner";

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buybidhq_users')
        .select('*');

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
      }));
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const insertData = {
        full_name: userData.fullName,
        email: userData.email,
        role: userData.role,
        mobile_number: userData.mobileNumber,
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
