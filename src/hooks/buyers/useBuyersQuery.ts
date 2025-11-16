
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrentUser } from "../useCurrentUser";
import { useNavigate } from "react-router-dom";
import { BuyerResponse, MappedBuyer } from "./types";

export const useBuyersQuery = () => {
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['buyers', currentUser?.role],
    queryFn: async ({ signal }) => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) {
          console.error("No valid session:", sessionError);
          navigate('/signin');
          return [];
        }

        console.log("Current user role:", currentUser?.role);

        // Fetch buyers data - add proper error handling for 406
        const { data: buyersData, error: buyersError } = await supabase
          .from('buyers')
          .select(`
            id,
            user_id,
            buyer_name,
            email,
            dealer_name,
            dealer_id,
            buyer_mobile,
            buyer_phone,
            city,
            state,
            zip_code,
            address,
            phone_carrier,
            phone_validation_status
          `)
          .is('deleted_at', null)
          .abortSignal(signal as AbortSignal)
          .order('created_at', { ascending: false });

        if (buyersError) {
          console.error("Buyer fetch error:", buyersError);
          if (buyersError.code === 'PGRST116') {
            navigate('/signin');
            return [];
          }
          throw buyersError;
        }

        if (!buyersData) {
          console.log("No data returned from query");
          return [];
        }

        // Fetch bid response counts for all buyers
        const { data: bidCounts, error: countsError } = await supabase
          .from('bid_responses')
          .select('buyer_id, status')
          .returns<Array<{
            buyer_id: string;
            status: 'accepted' | 'pending' | 'declined';
          }>>();

        if (countsError) {
          console.error("Bid counts fetch error:", countsError);
        }

        // Calculate counts per buyer
        const countsMap = new Map<string, { accepted: number; pending: number; declined: number }>();

        if (bidCounts) {
          bidCounts.forEach(response => {
            if (!countsMap.has(response.buyer_id)) {
              countsMap.set(response.buyer_id, { accepted: 0, pending: 0, declined: 0 });
            }
            const counts = countsMap.get(response.buyer_id)!;
            if (response.status === 'accepted') counts.accepted++;
            else if (response.status === 'pending') counts.pending++;
            else if (response.status === 'declined') counts.declined++;
          });
        }

        const data = buyersData;
        const error = buyersError;

        if (error) {
          console.error("Buyer fetch error:", error);
          if (error.code === 'PGRST116') {
            navigate('/signin');
            return [];
          }
          throw error;
        }

        if (!data) {
          console.log("No data returned from query");
          return [];
        }

        console.log("Raw buyers data:", data);

        const typedData = data as unknown as BuyerResponse[];
        const mappedBuyers: MappedBuyer[] = typedData.map(buyer => {
          console.log("Mapping buyer data:", buyer);
          
          const location = [buyer.city, buyer.state]
            .filter(Boolean)
            .join(', ');
          
          return {
            id: buyer.id,
            user_id: buyer.user_id || '',
            name: buyer.buyer_name || '',
            email: buyer.email || '',
            dealership: buyer.dealer_name || '',
            dealerId: buyer.dealer_id || '',
            mobileNumber: buyer.buyer_mobile || '',
            businessNumber: buyer.buyer_phone || '',
            location: location,
            address: buyer.address || '',
            city: buyer.city || '',
            state: buyer.state || '',
            zipCode: buyer.zip_code || '',
            phoneCarrier: buyer.phone_carrier || '',
            acceptedBids: countsMap.get(buyer.id)?.accepted || 0,
            pendingBids: countsMap.get(buyer.id)?.pending || 0,
            declinedBids: countsMap.get(buyer.id)?.declined || 0,
            phoneValidationStatus: buyer.phone_validation_status
          };
        });

        console.log("Mapped buyers:", mappedBuyers);
        return mappedBuyers;
      } catch (error: any) {
        console.error("Error in buyers query:", error);
        
        // AbortError is normal - query was cancelled (component unmounted or query invalidated)
        if (error.name === 'AbortError' || error.code === '20' || error.message?.includes('AbortError')) {
          console.log('Query cancelled (normal behavior)');
          return [];
        }
        
        // Real errors
        if (error.message?.includes('JWT')) {
          navigate('/signin');
          return [];
        }
        
        toast.error("Failed to fetch buyers. Please try again.");
        throw error;
      }
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry aborted queries or auth errors
      if (error?.message?.includes('JWT') || 
          error?.message?.includes('Invalid refresh token') ||
          error?.message?.includes('AbortError') ||
          error?.name === 'AbortError' ||
          error?.code === '20') {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
};
