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
      const { data, error } = await publicSupabase
        .from("carousel_listings")
        .select("*");

      if (error) throw error;

      return (data || []).map(listing => ({
        id: listing.id,
        created_at: listing.created_at,
        vehicle: {
          year: listing.year,
          make: listing.make,
          model: listing.model,
          mileage: listing.mileage,
        },
        image_url: listing.image_url,
        highest_offer: listing.highest_offer,
      })) as RecentBidRequest[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
