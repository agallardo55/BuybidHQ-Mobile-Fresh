import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";

// Use public client for anonymous access to recent listings
const supabaseUrl = "https://fdcfdbjputcitgxosnyk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkY2ZkYmpwdXRjaXRneG9zbnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4OTc2NjksImV4cCI6MjAzNDQ3MzY2OX0.x2lu4j7aZPc1zvMYS_ElsqVyzQg7WgerAD4LRPzFRZE";

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
      // Query RLS-protected tables (anon can only see approved bids from last 30 days)
      // Using vehicles_public to exclude VINs for security
      const { data: bidRequests, error } = await publicSupabase
        .from("bid_requests")
        .select(`
          id,
          created_at,
          vehicle_id
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get vehicle data, images, and highest offers for each bid request
      const bidRequestsWithData = await Promise.all(
        (bidRequests || []).map(async (request) => {
          // Query vehicles_public view (excludes VINs)
          const { data: vehicle } = await publicSupabase
            .from("vehicles_public")
            .select("year, make, model, mileage")
            .eq("id", request.vehicle_id)
            .single();

          const { data: images } = await publicSupabase
            .from("images")
            .select("image_url")
            .eq("bid_request_id", request.id)
            .order("sequence_order")
            .limit(1);

          const { data: responses } = await publicSupabase
            .from("bid_responses")
            .select("offer_amount")
            .eq("bid_request_id", request.id)
            .order("offer_amount", { ascending: false })
            .limit(1);

          return {
            id: request.id,
            created_at: request.created_at,
            vehicle: vehicle || { year: "", make: "", model: "", mileage: "" },
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
