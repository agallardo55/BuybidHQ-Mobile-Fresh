
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UsersQueryParams } from "./types";
import { User } from "@/types/users";
import { toast } from "sonner";
import { useCurrentUser } from "../useCurrentUser";
import { useNavigate } from "react-router-dom";

type DbUser = {
  id: string;
  created_at: string;
  full_name: string | null;
  email: string;
  mobile_number: string | null;
  role: User['role'];
  is_active: boolean;
  dealership_id: string | null;
  deleted_at: string | null;
  status: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone_carrier: string | null;
  phone_validated: boolean;
  company: string | null;
  dealership: {
    id: string;
    dealer_name: string;
    dealer_id: string | null;
    business_phone: string;
    business_email: string;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
  } | null;
};

export const useUsersQuery = ({ pageSize, currentPage, searchTerm }: UsersQueryParams) => {
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();

  return useQuery<{ users: User[]; total: number }, Error>({
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
            status,
            address,
            city,
            state,
            zip_code,
            phone_carrier,
            phone_validated,
            company,
            dealership:dealerships!buybidhq_users_dealership_id_fkey (
              id,
              dealer_name,
              dealer_id,
              business_phone,
              business_email,
              address,
              city,
              state,
              zip_code
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

        const users: User[] = (data as DbUser[])?.map(dbUser => ({
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          status: dbUser.status || '',
          full_name: dbUser.full_name,
          mobile_number: dbUser.mobile_number,
          address: dbUser.address,
          city: dbUser.city,
          state: dbUser.state,
          zip_code: dbUser.zip_code,
          dealership_id: dbUser.dealership_id,
          is_active: dbUser.is_active,
          created_at: dbUser.created_at,
          deleted_at: dbUser.deleted_at,
          phone_carrier: dbUser.phone_carrier,
          phone_validated: dbUser.phone_validated,
          company: dbUser.company,
          dealership: dbUser.dealership ? {
            id: dbUser.dealership.id,
            dealer_name: dbUser.dealership.dealer_name,
            dealer_id: dbUser.dealership.dealer_id,
            business_phone: dbUser.dealership.business_phone,
            business_email: dbUser.dealership.business_email,
            address: dbUser.dealership.address,
            city: dbUser.dealership.city,
            state: dbUser.dealership.state,
            zip_code: dbUser.dealership.zip_code,
            primary_user_id: null,
            primary_assigned_at: undefined,
          } : null
        }));

        return {
          users,
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
