
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dealership } from "@/types/dealerships";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export interface DealershipsQueryParams {
  pageSize: number;
  currentPage: number;
  searchTerm?: string;
}

export const useDealershipsQuery = ({ pageSize, currentPage, searchTerm }: DealershipsQueryParams) => {
  const navigate = useNavigate();

  return useQuery<{ dealerships: Dealership[]; total: number }>({
    queryKey: ['dealerships', pageSize, currentPage, searchTerm],
    queryFn: async () => {
      try {
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        // First get the dealerships
        let query = supabase
          .from('dealerships')
          .select('*', { count: 'exact' });

        if (searchTerm) {
          query = query.or([
            `dealer_name.ilike.%${searchTerm}%`,
            `dealer_id.ilike.%${searchTerm}%`,
            `business_email.ilike.%${searchTerm}%`
          ].join(','));
        }

        const { data: dealerships, error: dealershipsError, count } = await query
          .range(from, to)
          .order('created_at', { ascending: false });

        if (dealershipsError) {
          console.error('Error fetching dealerships:', dealershipsError);
          throw dealershipsError;
        }

        // Then get the account admin information for each dealership
        const dealershipIds = dealerships?.map(d => d.id) || [];
        
        // Get account admins for these dealerships using a simpler approach
        const { data: accountAdmins, error: accountAdminsError } = await supabase
          .from('account_administrators')
          .select(`
            user_id,
            full_name,
            email,
            mobile_number,
            account_id
          `)
          .eq('status', 'active');

        if (accountAdminsError) {
          console.error('Error fetching account admins:', accountAdminsError);
          throw accountAdminsError;
        }

        // Get user dealership mappings
        const userIds = accountAdmins?.map(admin => admin.user_id) || [];
        const { data: users, error: usersError } = await supabase
          .from('buybidhq_users')
          .select('id, dealership_id')
          .in('id', userIds);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          throw usersError;
        }

        // Map account admins to dealerships
        const dealershipsWithAccountAdmin = dealerships?.map(dealership => {
          const user = users?.find(u => u.dealership_id === dealership.id);
          const admin = user ? accountAdmins?.find(admin => admin.user_id === user.id) : null;
          
          return {
            ...dealership,
            account_admin: admin ? {
              id: admin.user_id,
              full_name: admin.full_name,
              email: admin.email,
              mobile_number: admin.mobile_number
            } : null
          };
        }) || [];

        return {
          dealerships: dealershipsWithAccountAdmin as Dealership[],
          total: count || 0
        };
      } catch (error: any) {
        console.error('Error in useDealershipsQuery:', error);
        if (error.message?.includes('JWT')) {
          navigate('/signin');
          return { dealerships: [], total: 0 };
        }
        toast.error('Failed to load dealerships. Please try again.');
        throw error;
      }
    }
  });
};
