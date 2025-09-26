
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBidResponseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      responseId, 
      status 
    }: { 
      responseId: string; 
      status: "pending" | "accepted" | "declined"
    }) => {
      console.log('🔄 BidResponseMutation called with:', { responseId, status });
      
      // First, get the bid_request_id for this response
      const { data: currentResponse, error: fetchError } = await supabase
        .from('bid_responses')
        .select('bid_request_id, status')
        .eq('id', responseId)
        .single();

      console.log('📋 Current response data:', currentResponse);

      if (fetchError) throw fetchError;

      // Update the target response
      const { error: updateError } = await supabase
        .from('bid_responses')
        .update({ status })
        .eq('id', responseId);

      console.log('✅ Response updated in DB:', { responseId, status, updateError });

      if (updateError) throw updateError;

      // If status is "accepted", decline all other responses for the same bid request
      if (status === "accepted") {
        const { error: declineError } = await supabase
          .from('bid_responses')
          .update({ status: 'declined' })
          .eq('bid_request_id', currentResponse.bid_request_id)
          .neq('id', responseId)
          .neq('status', 'declined'); // Only update non-declined responses

        if (declineError) throw declineError;

        // Update the bid request status to "Approved" when an offer is accepted
        const { error: bidRequestUpdateError } = await supabase
          .from('bid_requests')
          .update({ status: 'Approved' })
          .eq('id', currentResponse.bid_request_id);

        if (bidRequestUpdateError) throw bidRequestUpdateError;
      }
    },
    onSuccess: (_, { status }) => {
      console.log('🎉 Mutation successful, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['bidRequests'] });
      console.log('🔄 Cache invalidated');
      if (status === "accepted") {
        toast.success("Buybid offer Accepted all other offers will be declined");
      } else {
        toast.success("Bid response status updated successfully");
      }
    },
    onError: (error) => {
      console.error("Update bid response error:", error);
      toast.error("Failed to update bid response status. Please try again.");
    },
  });
};
