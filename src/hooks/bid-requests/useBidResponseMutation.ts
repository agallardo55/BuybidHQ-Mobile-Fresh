
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
      const { error } = await supabase
        .from('bid_responses')
        .update({ status })
        .eq('id', responseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bidRequests'] });
      toast.success("Bid response status updated successfully");
    },
    onError: (error) => {
      console.error("Update bid response error:", error);
      toast.error("Failed to update bid response status. Please try again.");
    },
  });
};
