import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BidRequest } from "@/components/bid-request/types";

interface UseMarketplaceVehicleProps {
  vehicleId: string | null;
  propsRequest?: BidRequest | null;
  isOpen: boolean;
}

interface UseMarketplaceVehicleResult {
  request: BidRequest | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching marketplace vehicle data
 */
export function useMarketplaceVehicle({
  vehicleId,
  propsRequest,
  isOpen,
}: UseMarketplaceVehicleProps): UseMarketplaceVehicleResult {
  const [request, setRequest] = useState<BidRequest | null>(propsRequest || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propsRequest) {
      setRequest(propsRequest);
      setLoading(false);
      return;
    }

    const fetchVehicleData = async () => {
      if (!vehicleId) return;

      setLoading(true);
      setError(null);

      try {
        const [bidRequestData] = await Promise.all([
          supabase
            .from("bid_requests")
            .select(
              `
              *,
              vehicle:vehicles(*),
              reconditioning:reconditioning(*),
              book_values:book_values(*),
              responses:bid_responses(
                id,
                offer_amount,
                status,
                buyer_id,
                buyers:buyers(
                  id,
                  buyer_name,
                  dealer_name,
                  email
                )
              )
            `
            )
            .eq("id", vehicleId)
            .single(),
        ]);

        if (bidRequestData.error) {
          console.error("Error fetching bid request:", bidRequestData.error);
          setError("Failed to load vehicle details. Please try again.");
          return;
        }

        setRequest(bidRequestData.data as unknown as BidRequest);
      } catch (err) {
        console.error("Error in fetchVehicleData:", err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && vehicleId && !propsRequest) {
      fetchVehicleData();
    }
  }, [vehicleId, isOpen, propsRequest]);

  return {
    request,
    loading,
    error,
  };
}
