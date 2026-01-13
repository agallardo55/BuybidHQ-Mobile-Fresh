
import { BidRequest } from "@/components/bid-request/types";
import { useCurrentUser } from "./useCurrentUser";
import { useBidRequestQuery } from "./bid-requests/useBidRequestQuery";
import { useBidRequestMutation } from "./bid-requests/useBidRequestMutation";

type BidRequestScope = 'user' | 'global';

interface UseBidRequestsOptions {
  scope?: BidRequestScope;
}

export const useBidRequests = (options: UseBidRequestsOptions = {}) => {
  const { scope = 'user' } = options;
  const { currentUser } = useCurrentUser();
  const { data: bidRequests = [], isLoading } = useBidRequestQuery({
    enabled: !!currentUser,
    scope
  });
  const { mutate: updateBidRequestStatus } = useBidRequestMutation();

  const updateBidRequest = (id: string, status: "pending" | "accepted" | "declined") => {
    updateBidRequestStatus({ id, status });
  };

  return {
    bidRequests,
    isLoading,
    updateBidRequest,
  };
};
