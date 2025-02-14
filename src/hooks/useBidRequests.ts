
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BidRequest } from "@/components/bid-request/types";
import { toast } from "sonner";
import { useCurrentUser } from "./useCurrentUser";

export const useBidRequests = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  const { data: bidRequests = [], isLoading } = useQuery({
    queryKey: ['bidRequests', currentUser?.role],
    queryFn: async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const query = supabase
          .from('bid_requests')
          .select(`
            id,
            status,
            vehicle:vehicle_id (
              year,
              make,
              model,
              trim,
              vin,
              mileage
            ),
            buyer:user_id (
              buyer_name,
              dealer_name
            ),
            bid_responses (
              offer_amount
            )
          `);

        // Apply filter based on role
        if (currentUser?.role !== 'admin') {
          query.eq('user_id', userData.user.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Bid request fetch error:", error);
          throw error;
        }

        if (!data) {
          return [];
        }

        return data.map(request => {
          const vehicle = request.vehicle;
          const buyer = request.buyer;
          const offers = request.bid_responses || [];

          return {
            id: request.id,
            year: vehicle ? parseInt(vehicle.year) : 0,
            make: vehicle?.make || '',
            model: vehicle?.model || '',
            trim: vehicle?.trim || '',
            vin: vehicle?.vin || '',
            mileage: vehicle ? parseInt(vehicle.mileage) : 0,
            buyer: buyer?.buyer_name || '',
            dealership: buyer?.dealer_name || '',
            highestOffer: Math.max(...(offers.map(r => Number(r.offer_amount)) || [0])),
            status: request.status as "Pending" | "Approved" | "Declined"
          };
        });
      } catch (error) {
        console.error("Error in bid requests query:", error);
        toast.error("Failed to fetch bid requests. Please try again.");
        throw error;
      }
    },
    enabled: !!currentUser,
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
