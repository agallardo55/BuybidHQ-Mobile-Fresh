import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVehicleImages = (bidRequestId: string | null, enabled: boolean) => {
  return useQuery({
    queryKey: ['vehicle-images', bidRequestId],
    queryFn: async () => {
      if (!bidRequestId) return [];
      
      const { data, error } = await supabase
        .from('images')
        .select('image_url')
        .eq('bid_request_id', bidRequestId);

      if (error) {
        console.error('Error fetching images:', error);
        throw error;
      }

      return data.map(img => img.image_url).filter((url): url is string => url !== null);
    },
    enabled: enabled && !!bidRequestId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
