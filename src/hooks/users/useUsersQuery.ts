
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UsersQueryParams } from "./types";
import { User } from "@/types/users";
import { toast } from "sonner";
import { useCurrentUser } from "../useCurrentUser";
import { useNavigate } from "react-router-dom";

export const useUsersQuery = ({ pageSize, currentPage, searchTerm }: UsersQueryParams) => {
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();

  return useQuery<{ users: User[]; total: number }>({
    queryKey: ['users', pageSize, currentPage, searchTerm],
    queryFn: async () => {
      try {
        // Calculate range for pagination
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        // Get current user's session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) {
          console.error("No valid session:", sessionError);
          navigate('/signin');
          return { users: [], total: 0 };
        }

        // Simplified query without joins to avoid recursion
        let query = supabase
          .from('buybidhq_users')
          .select('*', { count: 'exact' });

        // Add search filter if searchTerm is provided
        if (searchTerm) {
          query = query.or([
            `full_name.ilike.%${searchTerm}%`,
            `email.ilike.%${searchTerm}%`
          ].join(','));
        }

        // Add pagination
        const { data: users, error, count } = await query
          .range(from, to)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          throw error;
        }

        // Get dealership information in a separate query
        const dealershipIds = users
          ?.filter(user => user.dealership_id)
          .map(user => user.dealership_id);

        let dealerships = {};
        if (dealershipIds?.length > 0) {
          const { data: dealershipsData } = await supabase
            .from('dealerships')
            .select('*')
            .in('id', dealershipIds);

          dealerships = dealershipsData?.reduce((acc, dealership) => ({
            ...acc,
            [dealership.id]: dealership
          }), {});
        }

        // Combine users with their dealership information
        const enrichedUsers = users?.map(user => ({
          ...user,
          dealership: user.dealership_id ? dealerships[user.dealership_id] : null
        }));

        return {
          users: enrichedUsers || [],
          total: count || 0
        };
      } catch (error: any) {
        console.error('Error in useUsersQuery:', error);
        if (error.message?.includes('JWT')) {
          navigate('/signin');
          return { users: [], total: 0 };
        }
        toast.error('Failed to load users. Please try again.');
        throw error;
      }
    },
    enabled: !!currentUser,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('JWT') || 
          error?.message?.includes('Invalid refresh token')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
