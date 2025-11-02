import { useMemo } from "react";
import { useBidRequestQuery } from "./useBidRequestQuery";
import { useBidRequestMutation } from "./useBidRequestMutation";
import { useCurrentUser } from "../useCurrentUser";
import { BidRequest } from "@/components/bid-request/types";

/**
 * Hook for fetching bid requests specifically for BidRequestDashboard
 * Applies user-scoped filtering: regular users see only their own, admins see all
 * Note: RLS policies handle the initial filtering, but Market View policy allows all,
 * so we apply additional filtering here for non-admin users
 * 
 * Returns the same interface as useBidRequests for easy drop-in replacement
 */
export const useBidRequestsForDashboard = () => {
  const { currentUser } = useCurrentUser();
  const { data: allBidRequests = [], isLoading } = useBidRequestQuery(!!currentUser);
  const { mutate: updateBidRequestStatus } = useBidRequestMutation();

  // Determine if user is admin/super_admin
  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    return (
      currentUser.role === 'admin' ||
      currentUser.app_role === 'super_admin' ||
      currentUser.app_role === 'account_admin'
    );
  }, [currentUser]);

  // Filter bid requests based on user role
  const bidRequests = useMemo(() => {
    if (isAdmin) {
      // Admins see all bid requests (no filtering needed)
      return allBidRequests;
    }
    
    // Regular users only see their own bid requests (where user_id matches)
    if (!currentUser?.id) {
      return [];
    }

    return allBidRequests.filter((request: BidRequest) => {
      // Regular users only see bid requests they created
      return request.userId === currentUser.id;
    });
  }, [allBidRequests, isAdmin, currentUser?.id]);

  const updateBidRequest = (id: string, status: "pending" | "accepted" | "declined") => {
    updateBidRequestStatus({ id, status });
  };

  return {
    bidRequests,
    isLoading,
    updateBidRequest,
  };
};

