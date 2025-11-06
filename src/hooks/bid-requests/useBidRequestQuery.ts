
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BidRequest } from "@/components/bid-request/types";
import { mapResponsesToOffers, transformBidRequest } from "./utils";

type BidStatus = "pending" | "accepted" | "declined";

const convertFromDbStatus = (status: string): BidStatus => {
  const normalizedStatus = status.toLowerCase();
  switch (normalizedStatus) {
    case "approved":
    case "accepted":
      return "accepted";
    case "pending":
      return "pending";
    case "declined":
      return "declined";
    default:
      return "pending";
  }
};

export const useBidRequestQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ['bidRequests'],
    queryFn: async () => {
      try {
        // Check session but allow anonymous users (RLS policies will handle access control)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        // Note: We allow anonymous queries for Market View - RLS policies handle access control
        if (sessionError && sessionError.message !== 'Session not found') {
          console.error("Session error:", sessionError);
          return [];
        }

        // Get all bid requests (RLS policies will handle access control for both authenticated and anonymous users)
        const { data: requests, error: requestError } = await supabase
          .from('bid_requests')
          .select('id, created_at, status, user_id');

        if (requestError) {
          console.error("Error fetching bid requests:", requestError);
          throw requestError;
        }

        if (!requests || requests.length === 0) {
          return [];
        }

        // Get details for each request
        const detailsPromises = requests.map(async (request) => {
          const { data, error } = await supabase
            .rpc('get_bid_request_details', {
              p_request_id: request.id
            });

          if (error) {
            console.error(`Error fetching details for request ${request.id}:`, error);
            return null;
          }

          // Get primary image for this request
          const { data: imageData } = await supabase
            .from('images')
            .select('image_url')
            .eq('bid_request_id', request.id)
            .order('sequence_order', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: true })
            .limit(1);

          const primaryImage = imageData?.[0]?.image_url || null;

          return {
            ...data?.[0],
            created_at: request.created_at,
            status: convertFromDbStatus(request.status),
            primary_image: primaryImage,
            user_id: request.user_id
          };
        });

        const details = (await Promise.all(detailsPromises)).filter(Boolean);

        // Get bid responses with buyer information
        const requestIds = details
          .map(item => item.request_id)
          .filter(id => id !== undefined && id !== null);
          
        let responses = [];
        let responsesError = null;
        
        // Only fetch responses if we have valid request IDs
        if (requestIds.length > 0) {
          const { data: responseData, error: responseError } = await supabase
            .from('bid_responses')
            .select(`
              id,
              bid_request_id,
              offer_amount,
              created_at,
              status,
              buyers!inner(
                buyer_name,
                dealer_name
              )
            `)
            .in('bid_request_id', requestIds)
            .order('offer_amount', { ascending: false });
            
          responses = responseData || [];
          responsesError = responseError;
        }

        if (responsesError) {
          console.error("Error fetching bid responses:", responsesError);
          throw responsesError;
        }

        console.log('📋 Raw responses from DB:', responses);

        // Transform responses to ensure status is of correct type
        const typedResponses = responses?.map(response => ({
          ...response,
          status: convertFromDbStatus(response.status)
        }));

        console.log('🔄 Responses after status conversion:', typedResponses);

        // Map responses to their requests
        const responsesMap = mapResponsesToOffers(typedResponses);

        // Transform to final format
        const transformedRequests = details.map((item) => {
          const offers = responsesMap.get(item.request_id) || [];
          return transformBidRequest(item, offers);
        });

        console.log('Transformed requests:', transformedRequests);

        return transformedRequests;
      } catch (error) {
        console.error("Error in bid requests query:", error);
        toast.error("Failed to fetch bid requests. Please try again.");
        throw error;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
