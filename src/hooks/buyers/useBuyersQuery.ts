
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrentUser } from "../useCurrentUser";
import { useNavigate } from "react-router-dom";
import { BuyerResponse, MappedBuyer } from "./types";

export const useBuyersQuery = () => {
  const { currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userId = currentUser?.id;
  const userRole = currentUser?.role;
  
  console.log('🔍 useBuyersQuery: Called with', { userId, userRole, isLoadingUser });

  const isEnabled = !!userId && !isLoadingUser;
  console.log('🔍 useBuyersQuery: Query enabled?', isEnabled, { userId, isLoadingUser });

  // Force clear this query's cache on mount
  useEffect(() => {
    if (currentUser?.id) {
      console.log('🔍 useBuyersQuery: Clearing cache for', ['buyers', currentUser?.id, currentUser?.role]);
      queryClient.invalidateQueries({ queryKey: ['buyers', currentUser?.id, currentUser?.role] });
    } else {
      console.log('🔍 useBuyersQuery: Skipping cache clear - no user ID yet');
    }
  }, [currentUser?.id, currentUser?.role, queryClient]);

  return useQuery({
    queryKey: ['buyers', currentUser?.id, currentUser?.role],
    queryFn: async ({ signal }) => {
      console.log('🔍 useBuyersQuery: queryFn EXECUTING', { userId, userRole });
      
      try {
        // Use currentUser from hook instead of calling getSession() again
        if (!currentUser?.id) {
          console.log("No current user available");
          return [];
        }

        console.log("🔍 useBuyersQuery: Fetching buyers for user:", currentUser.id, "role:", currentUser?.role);

        console.log('🔍 useBuyersQuery: About to query Supabase', { userId, userRole });

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

        console.log("Raw buyers data:", buyersData);

        const typedData = buyersData as unknown as BuyerResponse[];
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
    enabled: isEnabled, // Wait for user to load, then run if we have a user ID
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnMount: true, // Always refetch when component mounts (even if data is fresh)
    refetchOnWindowFocus: false, // Don't refetch on window focus
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
