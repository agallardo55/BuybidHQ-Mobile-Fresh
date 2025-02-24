
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BidRequest } from "@/components/bid-request/types";
import { mapResponsesToOffers, transformBidRequest } from "./utils";

type BidStatus = "Pending" | "Approved" | "Declined";

const validateStatus = (status: string): BidStatus => {
  return ["Pending", "Approved", "Declined"].includes(status) 
    ? (status as BidStatus) 
    : "Pending";
};

export const useBidRequestQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ['bidRequests'],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) {
          console.error("No valid session:", sessionError);
          return [];
        }

        // Get bid requests directly
        const { data: requests, error: requestError } = await supabase
          .from('bid_requests')
          .select('id, created_at, status');

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

          return {
            ...data?.[0],
            created_at: request.created_at,
            status: validateStatus(request.status)
          };
        });

        const details = (await Promise.all(detailsPromises)).filter(Boolean);

        // Get bid responses with buyer information
        const requestIds = details.map(item => item.request_id);
        const { data: responses, error: responsesError } = await supabase
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

        if (responsesError) {
          console.error("Error fetching bid responses:", responsesError);
          throw responsesError;
        }

        console.log('Fetched responses:', responses);

        // Transform responses to ensure status is of correct type
        const typedResponses = responses?.map(response => ({
          ...response,
          status: validateStatus(response.status)
        }));

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
