import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePrefetchVehicleDetails = () => {
  const queryClient = useQueryClient();
  
  const prefetchImages = async (bidRequestId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['vehicle-images', bidRequestId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('images')
          .select('image_url')
          .eq('bid_request_id', bidRequestId);

        if (error) throw error;
        
        return data.map(img => img.image_url).filter((url): url is string => url !== null);
      },
      staleTime: 10 * 60 * 1000,
    });
  };
  
  return { prefetchImages };
};
