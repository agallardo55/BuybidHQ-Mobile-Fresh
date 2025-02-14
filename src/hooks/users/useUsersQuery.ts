
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

        // Get current user's session and role
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('Authentication error');
        }

        if (!session?.user?.id) {
          console.error('No active session');
          throw new Error('No active session');
        }

        // Get current user's role and dealership from cache
        const { data: userCache, error: cacheError } = await supabase
          .from('user_access_cache')
          .select('role, dealership_id')
          .eq('user_id', session.user.id)
          .single();

        if (cacheError) {
          console.error('Error fetching user role:', cacheError);
          throw cacheError;
        }

        let query = supabase
          .from('buybidhq_users')
          .select(`
            *,
            dealership:dealerships (*)
          `, { count: 'exact' });

        // Add role-based filters
        if (userCache.role === 'dealer' && userCache.dealership_id) {
          // Dealers can only see their associates
          query = query
            .eq('dealership_id', userCache.dealership_id)
            .eq('role', 'associate');
        } else if (userCache.role !== 'admin') {
          // Non-admin/dealer users can't see any users
          query = query.eq('id', session.user.id);
        }

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
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          throw error;
        }

        return {
          users: data || [],
          total: count || 0
        };
      } catch (error: any) {
        console.error('Error in useUsersQuery:', error);
        toast.error('Failed to load users. Please try again.');
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};
