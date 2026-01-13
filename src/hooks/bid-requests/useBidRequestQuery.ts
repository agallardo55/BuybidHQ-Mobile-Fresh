
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/utils/notificationToast";
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

type BidRequestScope = 'user' | 'global';

interface UseBidRequestQueryOptions {
  enabled: boolean;
  scope?: BidRequestScope;
}

export const useBidRequestQuery = (options: UseBidRequestQueryOptions) => {
  const { enabled, scope = 'user' } = options;
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bidRequests', scope],
    queryFn: async () => {
      try {
        // Use user from AuthContext which already has app_role in app_metadata
        const app_role = user?.app_metadata?.app_role;

        // Build query with filtering based on scope
        let bidRequestsQuery = supabase
          .from('bid_requests')
          .select('id, created_at, status, user_id');

        // Apply filtering based on scope and user role
        if (scope === 'user') {
          // Dashboard scope: Users see only THEIR OWN bid requests, super_admins see all
          if (app_role !== 'super_admin' && user) {
            bidRequestsQuery = bidRequestsQuery.eq('user_id', user.id);
            console.log('🔍 Filtering bid requests by user_id (Dashboard):', user.id);
          } else if (app_role === 'super_admin') {
            console.log('🔍 Super admin - showing all bid requests (Dashboard)');
          }
        } else if (scope === 'global') {
          // Marketplace scope: All authenticated users see ALL bid requests
          console.log('🔍 Marketplace - showing all bid requests globally');
          // No filtering - RLS policies allow all authenticated users to view
        }

        // Get bid requests (with account filtering if applicable)
        const { data: requests, error: requestError } = await bidRequestsQuery;

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
