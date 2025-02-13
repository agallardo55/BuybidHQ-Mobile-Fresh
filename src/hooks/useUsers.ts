
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserFormData } from "@/types/users";
import { toast } from "sonner";
import { useCurrentUser } from "./useCurrentUser";

interface UsePaginatedUsersProps {
  pageSize: number;
  currentPage: number;
  searchTerm?: string;
}

interface PaginatedResponse {
  users: any[];
  total: number;
}

export const useUsers = ({ pageSize, currentPage, searchTerm }: UsePaginatedUsersProps) => {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  const { data, isLoading } = useQuery({
    queryKey: ['users', currentPage, pageSize, searchTerm],
    queryFn: async (): Promise<PaginatedResponse> => {
      // First, get total count with search filter if present
      let query = supabase
        .from('buybidhq_users')
        .select('count', { count: 'exact' })
        .is('deleted_at', null);  // Only count non-deleted users

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%`);
      }

      const { count, error: countError } = await query;

      if (countError) {
        toast.error("Failed to fetch total users count: " + countError.message);
        throw countError;
      }

      // Then get paginated data
      const startRange = (currentPage - 1) * pageSize;
      const endRange = startRange + pageSize - 1;

      let dataQuery = supabase
        .from('buybidhq_users')
        .select('*, dealerships:dealership_id(*)')
        .is('deleted_at', null)  // Only fetch non-deleted users
        .range(startRange, endRange);

      if (searchTerm) {
        dataQuery = dataQuery.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%`);
      }

      const { data: users, error } = await dataQuery;

      if (error) {
        toast.error("Failed to fetch users: " + error.message);
        throw error;
      }

      return {
        users: users.map(user => ({
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
        })),
        total: count || 0
      };
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
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
    users: data?.users || [],
    total: data?.total || 0,
    isLoading,
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
  };
};
