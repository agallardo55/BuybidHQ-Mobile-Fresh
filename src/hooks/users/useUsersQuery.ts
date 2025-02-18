
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
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) {
          console.error("No valid session:", sessionError);
          navigate('/signin');
          return { users: [], total: 0 };
        }

        let query = supabase
          .from('buybidhq_users')
          .select(`
            id,
            created_at,
            full_name,
            email,
            mobile_number,
            role,
            is_active,
            dealership_id,
            deleted_at,
            dealership:dealerships (
              id,
              dealer_name,
              dealer_id,
              business_phone,
              business_email
            )
          `, { count: 'exact' });

        if (searchTerm) {
          query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }

        const { data, error, count } = await query
          .range(from, to)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          if (error.message?.includes('JWT')) {
            navigate('/signin');
            return { users: [], total: 0 };
          }
          throw error;
        }

        return {
          users: data || [],
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
