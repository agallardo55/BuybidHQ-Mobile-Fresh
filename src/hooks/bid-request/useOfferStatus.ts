import { useState, useEffect, useCallback } from "react";

export type OfferStatus = "pending" | "accepted" | "declined";

interface UseOfferStatusProps {
  requestId: string | undefined;
  onStatusUpdate?: (responseId: string, status: OfferStatus) => Promise<void>;
}

interface UseOfferStatusResult {
  localOfferStatuses: Record<string, OfferStatus>;
  loadingOffers: Set<string>;
  getCurrentStatus: (buyerId: string, serverStatus: string) => string;
  handleStatusUpdate: (
    buyerId: string,
    responseId: string,
    value: OfferStatus
  ) => Promise<void>;
}

/**
 * Hook for managing optimistic offer status updates
 */
export function useOfferStatus({
  requestId,
  onStatusUpdate,
}: UseOfferStatusProps): UseOfferStatusResult {
  const [localOfferStatuses, setLocalOfferStatuses] = useState<
    Record<string, OfferStatus>
  >({});
  const [loadingOffers, setLoadingOffers] = useState<Set<string>>(new Set());

  // Clear local state when request changes
  useEffect(() => {
    setLocalOfferStatuses({});
  }, [requestId]);

  const getCurrentStatus = useCallback(
    (buyerId: string, serverStatus: string): string => {
      return localOfferStatuses[buyerId] || serverStatus.toLowerCase();
    },
    [localOfferStatuses]
  );

  const handleStatusUpdate = useCallback(
    async (
      buyerId: string,
      responseId: string,
      value: OfferStatus
    ): Promise<void> => {
      // Optimistic update
      setLocalOfferStatuses((prev) => ({ ...prev, [buyerId]: value }));
      setLoadingOffers((prev) => new Set([...prev, buyerId]));

      try {
        if (onStatusUpdate) {
          await onStatusUpdate(responseId, value);
          // Clear local state on success (server state is now authoritative)
          setLocalOfferStatuses((prev) => {
            const newState = { ...prev };
            delete newState[buyerId];
            return newState;
          });
        }
      } catch (error) {
        // Revert optimistic update on failure
        setLocalOfferStatuses((prev) => {
          const newState = { ...prev };
          delete newState[buyerId];
          return newState;
        });
        console.error("Failed to update offer status:", error);
      } finally {
        setLoadingOffers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(buyerId);
          return newSet;
        });
      }
    },
    [onStatusUpdate]
  );

  return {
    localOfferStatuses,
    loadingOffers,
    getCurrentStatus,
    handleStatusUpdate,
  };
}
