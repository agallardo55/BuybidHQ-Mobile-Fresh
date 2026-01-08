
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dealership } from "@/types/dealerships";
import { toast } from "@/utils/notificationToast";
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

        // First get the dealerships from unified view (includes both individual_dealers and dealerships)
        let query = supabase
          .from('unified_dealer_info')
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

        // Map account admins to dealerships using user_id from unified view
        // unified_dealer_info already contains user_id, so we can join directly
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

        // Map account admins to dealerships by matching user_id
        const dealershipsWithAccountAdmin = dealerships?.map(dealership => {
          // unified_dealer_info includes user_id field (from individual_dealers or dealerships)
          const admin = accountAdmins?.find(admin => admin.user_id === (dealership as any).user_id);

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
