import { useMemo } from "react";
import { useBidRequestQuery } from "./useBidRequestQuery";
import { useBidRequestMutation } from "./useBidRequestMutation";
import { useCurrentUser } from "../useCurrentUser";
import { BidRequest } from "@/components/bid-request/types";

/**
 * Hook for fetching bid requests specifically for BidRequestDashboard
 *
 * FILTERING LOGIC:
 * 1. Database-level (useBidRequestQuery): Filters by account_id for all non-super_admin users
 *    - Individual dealers see only bid requests from their own account
 *    - Team members see only bid requests from their account
 *    - Super admins see all bid requests (no account filter)
 *
 * 2. Client-level (this hook): Additional filtering based on role
 *    - account_admin users see ALL bid requests from their account
 *    - Regular team members see only their OWN bid requests (user_id filter)
 *
 * Returns the same interface as useBidRequests for easy drop-in replacement
 */
export const useBidRequestsForDashboard = () => {
  const { currentUser } = useCurrentUser();
  const { data: allBidRequests = [], isLoading } = useBidRequestQuery(!!currentUser);
  const { mutate: updateBidRequestStatus } = useBidRequestMutation();

  // Determine if user is account admin or super admin
  const isAccountAdmin = useMemo(() => {
    if (!currentUser) return false;
    return (
      currentUser.app_role === 'super_admin' ||
      currentUser.app_role === 'account_admin'
    );
  }, [currentUser]);

  // Filter bid requests based on user role
  const bidRequests = useMemo(() => {
    if (isAccountAdmin) {
      // Account admins see all bid requests from their account (already filtered by query)
      // Super admins see all bid requests globally (no account filter in query)
      return allBidRequests;
    }

    // Regular team members only see their own bid requests (where user_id matches)
    if (!currentUser?.id) {
      return [];
    }

    return allBidRequests.filter((request: BidRequest) => {
      // Regular users only see bid requests they created
      return request.userId === currentUser.id;
    });
  }, [allBidRequests, isAccountAdmin, currentUser?.id]);

  const updateBidRequest = (id: string, status: "pending" | "accepted" | "declined") => {
    updateBidRequestStatus({ id, status });
  };

  return {
    bidRequests,
    isLoading,
    updateBidRequest,
  };
};

