import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";

// Use public client for anonymous access to recent listings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const publicSupabase = createClient(supabaseUrl, supabaseAnonKey);

export interface RecentBidRequest {
  id: string;
  created_at: string;
  vehicle: {
    year: string;
    make: string;
    model: string;
    mileage: string;
  };
  image_url: string | null;
  highest_offer: number | null;
}

export const useRecentBidRequests = () => {
  return useQuery({
    queryKey: ["recent-bid-requests"],
    queryFn: async () => {
      const { data: bidRequests, error } = await publicSupabase
        .from("bid_requests")
        .select(`
          id,
          created_at,
          vehicle_id,
          vehicles (
            year,
            make,
            model,
            mileage
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get images for each bid request
      const bidRequestsWithData = await Promise.all(
        (bidRequests || []).map(async (request) => {
          // Get first image
          const { data: images } = await publicSupabase
            .from("images")
            .select("image_url")
            .eq("bid_request_id", request.id)
            .order("sequence_order")
            .limit(1);

          // Get highest offer
          const { data: responses } = await publicSupabase
            .from("bid_responses")
            .select("offer_amount")
            .eq("bid_request_id", request.id)
            .order("offer_amount", { ascending: false })
            .limit(1);

          return {
            id: request.id,
            created_at: request.created_at,
            vehicle: request.vehicles as any,
            image_url: images?.[0]?.image_url || null,
            highest_offer: responses?.[0]?.offer_amount || null,
          };
        })
      );

      return bidRequestsWithData as RecentBidRequest[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
