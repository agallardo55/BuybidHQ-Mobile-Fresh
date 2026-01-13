import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface InvitedBuyer {
  id: string;
  buyer_name: string | null;
  dealer_name: string | null;
  hasResponded: boolean;
  offerAmount?: number;
  offerStatus?: string;
  offerCreatedAt?: string;
  responseId?: string;
}

interface UseBidRequestBuyersResult {
  invitedBuyers: InvitedBuyer[];
  loadingBuyers: boolean;
  highestOffer: InvitedBuyer | null;
}

/**
 * Hook for fetching and managing invited buyers for a bid request
 */
export function useBidRequestBuyers(
  requestId: string | undefined,
  isOpen: boolean
): UseBidRequestBuyersResult {
  const [invitedBuyers, setInvitedBuyers] = useState<InvitedBuyer[]>([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);

  useEffect(() => {
    const fetchInvitedBuyers = async () => {
      if (!requestId) return;

      setLoadingBuyers(true);
      try {
        const { data: tokens, error: tokensError } = await supabase
          .from("bid_submission_tokens")
          .select(
            `
            buyer_id,
            buyers!inner(
              id,
              buyer_name,
              dealer_name
            )
          `
          )
          .eq("bid_request_id", requestId);

        if (tokensError) {
          console.error("Error fetching invited buyers:", tokensError);
          setLoadingBuyers(false);
          return;
        }

        const { data: responses, error: responsesError } = await supabase
          .from("bid_responses")
          .select("id, buyer_id, offer_amount, status, created_at")
          .eq("bid_request_id", requestId);

        if (responsesError) {
          console.error("Error fetching responses:", responsesError);
        }

        interface TokenWithBuyer {
          buyer_id: string;
          buyers: {
            id: string;
            buyer_name: string | null;
            dealer_name: string | null;
          };
        }

        interface BidResponse {
          id: string;
          buyer_id: string;
          offer_amount?: number;
          status: string;
          created_at: string;
        }

        const buyersWithStatus = (tokens || []).map((token: TokenWithBuyer) => {
          const buyer = token.buyers;
          const response = (responses as BidResponse[] | null)?.find(
            (r) => r.buyer_id === buyer.id
          );

          return {
            id: buyer.id,
            buyer_name: buyer.buyer_name || null,
            dealer_name: buyer.dealer_name || null,
            hasResponded: !!response,
            offerAmount: response?.offer_amount,
            offerStatus: response?.status,
            offerCreatedAt: response?.created_at,
            responseId: response?.id,
          };
        });

        setInvitedBuyers(buyersWithStatus);
      } catch (error) {
        console.error("Error in fetchInvitedBuyers:", error);
      } finally {
        setLoadingBuyers(false);
      }
    };

    fetchInvitedBuyers();
  }, [requestId, isOpen]);

  const getHighestOffer = (): InvitedBuyer | null => {
    const respondedBuyers = invitedBuyers.filter(
      (b) => b.hasResponded && b.offerAmount !== undefined
    );
    if (respondedBuyers.length === 0) return null;
    return respondedBuyers.reduce((highest, current) =>
      (current.offerAmount || 0) > (highest.offerAmount || 0) ? current : highest
    );
  };

  return {
    invitedBuyers,
    loadingBuyers,
    highestOffer: getHighestOffer(),
  };
}
