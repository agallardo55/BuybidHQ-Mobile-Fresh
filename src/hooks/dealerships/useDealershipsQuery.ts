
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

        // Then get the primary dealer information separately
        const primaryUserIds = dealerships
          ?.filter(d => d.primary_user_id)
          .map(d => d.primary_user_id) || [];

        const { data: primaryDealers, error: primaryDealersError } = await supabase
          .from('buybidhq_users')
          .select('id, full_name, email, mobile_number')
          .in('id', primaryUserIds);

        if (primaryDealersError) {
          console.error('Error fetching primary dealers:', primaryDealersError);
          throw primaryDealersError;
        }

        // Map primary dealers to dealerships
        const dealershipsWithPrimaryDealer = dealerships?.map(dealership => ({
          ...dealership,
          primary_dealer: primaryDealers?.find(pd => pd.id === dealership.primary_user_id) || null
        })) || [];

        return {
          dealerships: dealershipsWithPrimaryDealer as Dealership[],
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
