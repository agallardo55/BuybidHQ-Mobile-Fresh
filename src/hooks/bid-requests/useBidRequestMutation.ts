
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define valid database status types
type DatabaseStatus = "Approved" | "Pending" | "Declined";
type UIStatus = "pending" | "accepted" | "declined";

// Helper function to convert UI status to database status
const convertToDbStatus = (status: UIStatus): DatabaseStatus => {
  switch (status) {
    case "accepted":
      return "Approved";
    case "pending":
      return "Pending";
    case "declined":
      return "Declined";
    default:
      return "Pending"; // Default fallback
  }
};

export const useBidRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: UIStatus }) => {
      const dbStatus = convertToDbStatus(status);
      
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
