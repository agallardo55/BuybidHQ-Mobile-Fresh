import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBidRequestDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      console.log(`Deleting bid request ${id}`, reason ? `Reason: ${reason}` : '');
      
      // Step 1: Delete related access records first
      console.log('Deleting bid_request_access records...');
      const { error: accessError } = await supabase
        .from('bid_request_access')
        .delete()
        .eq('bid_request_id', id);

      if (accessError) {
        console.error('Error deleting bid_request_access:', accessError);
        throw new Error(`Failed to delete access records: ${accessError.message}`);
      }

      // Step 2: Now safe to delete the bid request
      console.log('Deleting bid_request...');
      const { error: bidRequestError } = await supabase
        .from('bid_requests')
        .delete()
        .eq('id', id);

      if (bidRequestError) {
        console.error('Error deleting bid_request:', bidRequestError);
        throw new Error(`Failed to delete bid request: ${bidRequestError.message}`);
      }
      
      console.log('Bid request and related records deleted successfully');
      return { id, reason };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bidRequests'] });
      toast.success("Bid request deleted successfully");
    },
    onError: (error: Error) => {
      console.error('Error deleting bid request:', error);
      toast.error(`Failed to delete bid request: ${error.message}`);
    },
  });
};
