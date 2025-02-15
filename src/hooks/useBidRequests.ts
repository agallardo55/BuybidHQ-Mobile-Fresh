
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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) {
          console.error("No valid session:", sessionError);
          return [];
        }

        console.log("Current user role:", currentUser?.role);

        const { data, error } = await supabase
          .from('bid_requests')
          .select(`
            id,
            created_at,
            status,
            vehicles (
              year,
              make,
              model,
              trim,
              vin,
              mileage,
              engine,
              transmission,
              drivetrain,
              exterior,
              interior,
              options
            ),
            reconditioning (
              windshield,
              engine_light,
              brakes,
              tires,
              maintenance,
              recon_est,
              recod_details
            ),
            bid_responses (
              offer_amount,
              buyers (
                buyer_name,
                dealer_name
              )
            )
          `)
          .order('created_at', { ascending: false });

        console.log("Query response:", { data, error });

        if (error) {
          console.error("Bid request fetch error:", error);
          throw error;
        }

        if (!data) {
          console.log("No data returned from query");
          return [];
        }

        const mappedRequests = data.map(request => {
          const offerAmounts = request.bid_responses?.map(r => Number(r.offer_amount)) || [];
          const hasOffers = offerAmounts.length > 0;
          const highestBid = request.bid_responses?.reduce((highest, current) => {
            if (!highest || current.offer_amount > highest.offer_amount) {
              return current;
            }
            return highest;
          }, null as any);

          return {
            id: request.id,
            createdAt: request.created_at,
            year: request.vehicles?.year ? parseInt(request.vehicles.year) : 0,
            make: request.vehicles?.make || '',
            model: request.vehicles?.model || '',
            trim: request.vehicles?.trim || '',
            vin: request.vehicles?.vin || '',
            mileage: request.vehicles?.mileage ? parseInt(request.vehicles.mileage) : 0,
            buyer: highestBid?.buyers?.buyer_name || '',
            highestOffer: hasOffers ? Math.max(...offerAmounts) : null,
            status: request.status,
            engineCylinders: request.vehicles?.engine || '',
            transmission: request.vehicles?.transmission || '',
            drivetrain: request.vehicles?.drivetrain || '',
            exteriorColor: request.vehicles?.exterior || '',
            interiorColor: request.vehicles?.interior || '',
            accessories: request.vehicles?.options || '',
            // Map reconditioning information
            windshield: request.reconditioning?.windshield || '',
            engineLights: request.reconditioning?.engine_light || '',
            brakes: request.reconditioning?.brakes || '',
            tire: request.reconditioning?.tires || '',
            maintenance: request.reconditioning?.maintenance || '',
            reconEstimate: request.reconditioning?.recon_est || '',
            reconDetails: request.reconditioning?.recod_details || ''
          };
        });

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
