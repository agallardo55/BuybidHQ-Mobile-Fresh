export const PLAN_HIERARCHY = {
  'free': 0,
  'connect': 1, 
  'annual': 2,
  'dealership': 3
} as const;

export type PlanType = keyof typeof PLAN_HIERARCHY;

export interface PlanButtonConfig {
  text: string;
  className: string;
  isDowngrade: boolean;
}

export const getPlanButtonConfig = (
  currentPlan: string | undefined,
  targetPlan: string
): PlanButtonConfig => {
  const currentLevel = PLAN_HIERARCHY[currentPlan as PlanType] ?? 0;
  const targetLevel = PLAN_HIERARCHY[targetPlan as PlanType] ?? 0;

  const isDowngrade = targetLevel < currentLevel;

  if (isDowngrade) {
    return {
      text: 'Downgrade Plan',
      className: 'bg-orange-500 hover:bg-orange-600 text-white',
      isDowngrade: true
    };
  }

  return {
    text: 'Upgrade Plan',
    className: 'bg-brand hover:bg-brand/90',
    isDowngrade: false
  };
};

/**
 * Determines if a user should be able to see offer prices in Market View
 *
 * PRICING VISIBILITY RULES:
 * - Beta (free) plan: NO price visibility (must upgrade to Connect/Annual)
 * - Connect ($99/month) plan: YES price visibility
 * - Annual ($599/year) plan: YES price visibility (stored as 'connect' with billing_cycle='annual')
 * - Super admins: YES price visibility (system admin override)
 *
 * NOTE: Individual dealers on beta plan CANNOT see prices even though they're account_admins.
 * They must upgrade to Connect or Annual to see marketplace prices.
 */
export const canUserSeePrices = (
  accountPlan: string | undefined,
  userRole?: string,
  userAppRole?: string
): boolean => {
  // Only super_admins can override plan restrictions
  // (Individual dealers on free plan still cannot see prices)
  if (userAppRole === 'super_admin') {
    return true;
  }

  // All other users depend on their account plan:
  // - 'free' (beta) = NO price visibility
  // - 'connect' (monthly or annual) = YES price visibility
  // - 'group'/'dealership' (future) = YES price visibility
  return accountPlan !== 'free';
};
