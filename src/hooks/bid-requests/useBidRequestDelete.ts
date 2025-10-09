import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBidRequestDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      console.log(`Deleting bid request ${id}`, reason ? `Reason: ${reason}` : '');
      
      const { error } = await supabase
        .from('bid_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
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
