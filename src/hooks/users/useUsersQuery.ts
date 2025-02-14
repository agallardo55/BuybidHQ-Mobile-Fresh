
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UsersQueryParams } from "./types";
import { User } from "@/types/users";

export const useUsersQuery = ({ pageSize, currentPage, searchTerm }: UsersQueryParams) => {
  return useQuery<{ users: User[]; total: number }>({
    queryKey: ['users', pageSize, currentPage, searchTerm],
    queryFn: async () => {
      // Calculate range for pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('buybidhq_users')
        .select(`
          *,
          dealership:dealerships (*)
        `, { count: 'exact' });

      // Add search filter if searchTerm is provided
      if (searchTerm) {
        query = query.or(`
          full_name.ilike.%${searchTerm}%,
          email.ilike.%${searchTerm}%,
          role.ilike.%${searchTerm}%
        `);
      }

      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        users: data || [],
        total: count || 0
      };
    }
  });
};
