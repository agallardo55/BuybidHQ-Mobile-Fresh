
import { BidRequest } from "@/components/bid-request/types";
import { useCurrentUser } from "./useCurrentUser";
import { useBidRequestQuery } from "./bid-requests/useBidRequestQuery";
import { useBidRequestMutation } from "./bid-requests/useBidRequestMutation";

export const useBidRequests = () => {
  const { currentUser } = useCurrentUser();
  const { data: bidRequests = [], isLoading } = useBidRequestQuery(!!currentUser);
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
