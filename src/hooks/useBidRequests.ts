
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

        // Use a simpler query structure with proper foreign key references
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
              recon_estimate,
              recon_details
            ),
            user_id,
            bid_responses (
              offer_amount
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching bid requests:", error);
          throw error;
        }

        // Fetch user details separately to avoid recursion
        const userIds = data.map(item => item.user_id);
        const { data: users, error: usersError } = await supabase
          .from('buybidhq_users')
          .select('id, full_name')
          .in('id', userIds);

        if (usersError) {
          console.error("Error fetching users:", usersError);
          throw usersError;
        }

        // Create a map of user IDs to full names
        const userMap = new Map(users.map(user => [user.id, user.full_name]));

        return data.map((item): BidRequest => {
          // Find the highest offer among all bid responses
          const highestOffer = item.bid_responses?.length > 0
            ? Math.max(...item.bid_responses.map(response => response.offer_amount))
            : null;

          return {
            id: item.id,
            createdAt: item.created_at,
            year: parseInt(item.vehicles.year) || 0,
            make: item.vehicles.make,
            model: item.vehicles.model,
            trim: item.vehicles.trim,
            vin: item.vehicles.vin,
            mileage: parseInt(item.vehicles.mileage),
            buyer: userMap.get(item.user_id) || 'Unknown',
            highestOffer: highestOffer,
            status: item.status,
            engineCylinders: item.vehicles.engine,
            transmission: item.vehicles.transmission,
            drivetrain: item.vehicles.drivetrain,
            exteriorColor: item.vehicles.exterior,
            interiorColor: item.vehicles.interior,
            accessories: item.vehicles.options,
            windshield: item.reconditioning.windshield,
            engineLights: item.reconditioning.engine_light,
            brakes: item.reconditioning.brakes,
            tire: item.reconditioning.tires,
            maintenance: item.reconditioning.maintenance,
            reconEstimate: item.reconditioning.recon_estimate,
            reconDetails: item.reconditioning.recon_details
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
