
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

        let query = supabase
          .from('dealerships')
          .select(`
            *,
            primary_dealer:buybidhq_users!dealerships_primary_user_id_fkey (
              id,
              full_name,
              email,
              mobile_number
            )
          `, { count: 'exact' });

        if (searchTerm) {
          query = query.or([
            `dealer_name.ilike.%${searchTerm}%`,
            `dealer_id.ilike.%${searchTerm}%`,
            `business_email.ilike.%${searchTerm}%`
          ].join(','));
        }

        const { data, error, count } = await query
          .range(from, to)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching dealerships:', error);
          throw error;
        }

        return {
          dealerships: data as Dealership[] || [],
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
