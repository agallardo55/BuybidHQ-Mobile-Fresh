import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBidRequestDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      console.log(`Deleting bid request ${id}`, reason ? `Reason: ${reason}` : '');
      
      // Step 1: Delete bid responses (offers on this request)
      console.log('Deleting bid_responses records...');
      const { error: responsesError } = await supabase
        .from('bid_responses')
        .delete()
        .eq('bid_request_id', id);

      if (responsesError) {
        console.error('Error deleting bid_responses:', responsesError);
        throw new Error(`Failed to delete bid responses: ${responsesError.message}`);
      }

      // Step 2: Delete bid submission tokens
      console.log('Deleting bid_submission_tokens records...');
      const { error: tokensError } = await supabase
        .from('bid_submission_tokens')
        .delete()
        .eq('bid_request_id', id);

      if (tokensError) {
        console.error('Error deleting bid_submission_tokens:', tokensError);
        throw new Error(`Failed to delete submission tokens: ${tokensError.message}`);
      }

      // Step 3: Delete images
      console.log('Deleting images records...');
      const { error: imagesError } = await supabase
        .from('images')
        .delete()
        .eq('bid_request_id', id);

      if (imagesError) {
        console.error('Error deleting images:', imagesError);
        throw new Error(`Failed to delete images: ${imagesError.message}`);
      }

      // Step 4: Delete related access records
      console.log('Deleting bid_request_access records...');
      const { error: accessError } = await supabase
        .from('bid_request_access')
        .delete()
        .eq('bid_request_id', id);

      if (accessError) {
        console.error('Error deleting bid_request_access:', accessError);
        throw new Error(`Failed to delete access records: ${accessError.message}`);
      }

      // Step 5: Now safe to delete the bid request itself
      console.log('Deleting bid_request...');
      const { error: bidRequestError } = await supabase
        .from('bid_requests')
        .delete()
        .eq('id', id);

      if (bidRequestError) {
        console.error('Error deleting bid_request:', bidRequestError);
        throw new Error(`Failed to delete bid request: ${bidRequestError.message}`);
      }
      
      console.log('Bid request and all related records deleted successfully');
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
