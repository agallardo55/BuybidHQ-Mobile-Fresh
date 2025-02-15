
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

        // Get current user's session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('Authentication error');
        }

        if (!session?.user?.id) {
          console.error('No active session');
          throw new Error('No active session');
        }

        // Check if user is a superadmin
        const { data: isSuperAdmin, error: superAdminError } = await supabase
          .rpc('is_superadmin', { user_email: session.user.email });

        if (superAdminError) {
          console.error('Error checking superadmin status:', superAdminError);
          throw superAdminError;
        }

        // Get current user's role and dealership from cache if not superadmin
        let userCache;
        if (!isSuperAdmin) {
          const { data: cache, error: cacheError } = await supabase
            .from('user_access_cache')
            .select('role, dealership_id')
            .eq('user_id', session.user.id)
            .single();

          if (cacheError) {
            console.error('Error fetching user role:', cacheError);
            throw cacheError;
          }
          userCache = cache;
        }

        let query = supabase
          .from('buybidhq_users')
          .select(`
            *,
            dealership:dealerships (*)
          `, { count: 'exact' });

        // Add role-based filters
        if (!isSuperAdmin) {
          if (userCache?.role === 'dealer' && userCache?.dealership_id) {
            // Dealers can only see their associates
            query = query
              .eq('dealership_id', userCache.dealership_id)
              .eq('role', 'associate');
          } else {
            // Non-admin/dealer users can't see any users
            query = query.eq('id', session.user.id);
          }
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
