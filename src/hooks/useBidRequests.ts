
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BidRequest } from "@/components/bid-request/types";
import { toast } from "sonner";
import { useCurrentUser } from "./useCurrentUser";

interface BidRequestDetails {
  request_id: string;
  created_at: string;
  status: string;
  year: string;
  make: string;
  model: string;
  trim_level: string;
  vin: string;
  mileage: string;
  user_full_name: string;
  engine_cylinders: string;
  transmission: string;
  drivetrain: string;
  exterior_color: string;
  interior_color: string;
  accessories: string;
  windshield: string;
  engine_lights: string;
  brakes: string;
  tire: string;
  maintenance: string;
  recon_estimate: string;
  recon_details: string;
}

export const useBidRequests = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  const { data: bidRequests = [], isLoading } = useQuery({
    queryKey: ['bidRequests', currentUser?.role],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) {
          console.error("No valid session:", sessionError);
          return [];
        }

        console.log("Current user role:", currentUser?.role);

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

          // Combine the request status with the details
          return {
            ...data?.[0],
            created_at: request.created_at,
            status: request.status
          };
        });

        const details = (await Promise.all(detailsPromises)).filter(Boolean) as BidRequestDetails[];

        // Get bid responses
        const requestIds = details.map(item => item.request_id);
        const { data: responses, error: responsesError } = await supabase
          .from('bid_responses')
          .select('bid_request_id, offer_amount')
          .in('bid_request_id', requestIds);

        if (responsesError) {
          console.error("Error fetching bid responses:", responsesError);
          throw responsesError;
        }

        // Map responses
        const responsesMap = new Map();
        responses?.forEach(response => {
          const offers = responsesMap.get(response.bid_request_id) || [];
          offers.push(response.offer_amount);
          responsesMap.set(response.bid_request_id, offers);
        });

        // Transform to final format
        return details.map((item): BidRequest => {
          const responses = responsesMap.get(item.request_id) || [];
          const highestOffer = responses.length > 0 ? Math.max(...responses) : null;

          const status = ["Pending", "Approved", "Declined"].includes(item.status) 
            ? item.status as "Pending" | "Approved" | "Declined"
            : "Pending";

          return {
            id: item.request_id,
            createdAt: item.created_at,
            year: parseInt(item.year) || 0,
            make: item.make,
            model: item.model,
            trim: item.trim_level,
            vin: item.vin,
            mileage: parseInt(item.mileage),
            buyer: item.user_full_name || 'Unknown',
            highestOffer,
            status,
            engineCylinders: item.engine_cylinders,
            transmission: item.transmission,
            drivetrain: item.drivetrain,
            exteriorColor: item.exterior_color,
            interiorColor: item.interior_color,
            accessories: item.accessories,
            windshield: item.windshield,
            engineLights: item.engine_lights,
            brakes: item.brakes,
            tire: item.tire,
            maintenance: item.maintenance,
            reconEstimate: item.recon_estimate,
            reconDetails: item.recon_details
          };
        });

      } catch (error) {
        console.error("Error in bid requests query:", error);
        toast.error("Failed to fetch bid requests. Please try again.");
        throw error;
      }
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const updateBidRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "Pending" | "Approved" | "Declined" }) => {
      const { error } = await supabase
        .from('bid_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bidRequests'] });
      toast.success("Bid request status updated successfully");
    },
    onError: (error) => {
      console.error("Update bid request error:", error);
      toast.error("Failed to update bid request status. Please try again.");
    },
  });

  return {
    bidRequests,
    isLoading,
    updateBidRequest: updateBidRequestMutation.mutate,
  };
};
