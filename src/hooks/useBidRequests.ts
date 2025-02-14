
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BidRequest } from "@/components/bid-request/types";
import { toast } from "sonner";
import { useCurrentUser } from "./useCurrentUser";

// Define types for the database response
type Vehicle = {
  year: string | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  vin: string | null;
  mileage: string | null;
};

type Dealership = {
  dealer_name: string | null;
};

type Buyer = {
  buyer_name: string | null;
  dealer_name: string | null;
};

type BidResponse = {
  offer_amount: number;
};

type BidRequestResponse = {
  id: string;
  created_at: string;
  status: "Pending" | "Approved" | "Declined";
  vehicle: Vehicle | null;
  buyer: Buyer | null;
  bid_responses: BidResponse[] | null;
};

export const useBidRequests = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  const { data: bidRequests = [], isLoading } = useQuery({
    queryKey: ['bidRequests', currentUser?.role],
    queryFn: async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        console.log("Current user role:", currentUser?.role);
        console.log("User data:", userData);

        let query = supabase
          .from('bid_requests')
          .select(`
            id,
            created_at,
            status,
            vehicles!inner (
              year,
              make,
              model,
              trim,
              vin,
              mileage
            ),
            buyer:buyers (
              buyer_name,
              dealer_name
            ),
            bid_responses (
              offer_amount
            )
          `);

        // Apply filter based on role
        if (currentUser?.role !== 'admin') {
          query = query.eq('user_id', userData.user.id);
        }

        const { data, error } = await query;

        console.log("Query response:", { data, error });

        if (error) {
          console.error("Bid request fetch error:", error);
          throw error;
        }

        if (!data) {
          console.log("No data returned from query");
          return [];
        }

        const mappedRequests = data.map(request => ({
          id: request.id,
          createdAt: request.created_at,
          year: request.vehicles?.year ? parseInt(request.vehicles.year) : 0,
          make: request.vehicles?.make || '',
          model: request.vehicles?.model || '',
          trim: request.vehicles?.trim || '',
          vin: request.vehicles?.vin || '',
          mileage: request.vehicles?.mileage ? parseInt(request.vehicles.mileage) : 0,
          buyer: request.buyer?.buyer_name || '',
          dealership: request.buyer?.dealer_name || '',
          highestOffer: Math.max(...(request.bid_responses?.map(r => Number(r.offer_amount)) || [0])),
          status: request.status
        }));

        console.log("Mapped requests:", mappedRequests);

        return mappedRequests;
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
