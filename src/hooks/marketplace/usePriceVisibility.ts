import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAccount } from "@/hooks/useAccount";
import { canUserSeePrices } from "@/utils/planHelpers";

interface UsePriceVisibilityResult {
  shouldShowPrices: boolean;
  currentUser: ReturnType<typeof useCurrentUser>["currentUser"];
  account: ReturnType<typeof useAccount>["account"];
}

/**
 * Hook for determining if user should see prices based on their plan and role
 */
export function usePriceVisibility(): UsePriceVisibilityResult {
  const { currentUser } = useCurrentUser();
  const { account } = useAccount();

  const shouldShowPrices = useMemo(() => {
    return canUserSeePrices(
      account?.plan,
      currentUser?.role,
      currentUser?.app_role
    );
  }, [account?.plan, currentUser?.role, currentUser?.app_role]);

  return {
    shouldShowPrices,
    currentUser,
    account,
  };
}
