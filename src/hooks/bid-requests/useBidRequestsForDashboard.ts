import { useBidRequestQuery } from "./useBidRequestQuery";
import { useBidRequestMutation } from "./useBidRequestMutation";
import { useCurrentUser } from "../useCurrentUser";

/**
 * Hook for fetching bid requests specifically for BidRequestDashboard
 *
 * FILTERING LOGIC:
 * - Database-level (useBidRequestQuery with scope='user'):
 *   - Regular users see ONLY their own bid requests (user_id = auth.uid())
 *   - Super admins see ALL bid requests globally (no filter)
 *
 * Returns the same interface as useBidRequests for easy drop-in replacement
 */
export const useBidRequestsForDashboard = () => {
  const { currentUser } = useCurrentUser();
  const { data: bidRequests = [], isLoading } = useBidRequestQuery({
    enabled: !!currentUser,
    scope: 'user'
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

