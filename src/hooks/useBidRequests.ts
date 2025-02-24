
import { BidRequest } from "@/components/bid-request/types";
import { useCurrentUser } from "./useCurrentUser";
import { useBidRequestQuery } from "./bid-requests/useBidRequestQuery";
import { useBidRequestMutation } from "./bid-requests/useBidRequestMutation";

export const useBidRequests = () => {
  const { currentUser } = useCurrentUser();
  const { data: bidRequests = [], isLoading } = useBidRequestQuery(!!currentUser);
  const { mutate: updateBidRequest } = useBidRequestMutation();

  return {
    bidRequests,
    isLoading,
    updateBidRequest,
  };
};
