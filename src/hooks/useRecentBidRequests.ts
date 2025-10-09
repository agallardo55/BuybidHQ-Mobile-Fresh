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
      // Query secure carousel view (only exposes approved bids from last 30 days)
      const { data: bidRequests, error } = await publicSupabase
        .from("carousel_recent_vehicles")
        .select("*");

      if (error) throw error;

      // Transform to match expected interface
      return (bidRequests || []).map((request) => ({
        id: request.id,
        created_at: request.created_at,
        vehicle: {
          year: request.year,
          make: request.make,
          model: request.model,
          mileage: request.mileage,
        },
        image_url: request.image_url || null,
        highest_offer: request.highest_offer || null,
      })) as RecentBidRequest[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
