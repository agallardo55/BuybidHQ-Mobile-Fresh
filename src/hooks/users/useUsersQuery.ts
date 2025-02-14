
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UsersQueryParams } from "./types";
import { User } from "@/types/users";
import { toast } from "sonner";

export const useUsersQuery = ({ pageSize, currentPage, searchTerm }: UsersQueryParams) => {
  return useQuery<{ users: User[]; total: number }>({
    queryKey: ['users', pageSize, currentPage, searchTerm],
    queryFn: async () => {
      try {
        // Calculate range for pagination
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        // First, check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          toast.error('Please sign in to view users.');
          throw new Error('No active session');
        }

        let query = supabase
          .from('buybidhq_users')
          .select(`
            *,
            dealership:dealerships!inner (*)
          `, { count: 'exact' });

        // Add search filter if searchTerm is provided
        if (searchTerm) {
          query = query.or(`
            full_name.ilike.%${searchTerm}%,
            email.ilike.%${searchTerm}%,
            role.ilike.%${searchTerm}%
          `);
        }

        // Fetch users with pagination
        const { data, error, count } = await query
          .range(from, to)
          .is('deleted_at', null) // Only show non-deleted users
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          toast.error('Failed to load users. Please try again.');
          throw error;
        }

        return {
          users: data || [],
          total: count || 0
        };
      } catch (error) {
        console.error('Error in useUsersQuery:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};
