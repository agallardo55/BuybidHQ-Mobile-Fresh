
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBidRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "accepted" | "declined" }) => {
      // Convert status to database format
      const dbStatus = status === "accepted" ? "Approved" : status.charAt(0).toUpperCase() + status.slice(1);
      
      const { error } = await supabase
        .from('bid_requests')
        .update({ status: dbStatus })
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
};
