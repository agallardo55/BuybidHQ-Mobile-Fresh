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
  
  if (targetPlan === 'free') {
    return {
      text: 'Start Free Trial',
      className: 'bg-accent hover:bg-accent/90',
      isDowngrade: false
    };
  }
  
  if (isDowngrade) {
    return {
      text: 'Downgrade Plan',
      className: 'bg-orange-500 hover:bg-orange-600 text-white',
      isDowngrade: true
    };
  }
  
  return {
    text: 'Upgrade Plan',
    className: 'bg-accent hover:bg-accent/90',
    isDowngrade: false
  };
};

/**
 * Determines if a user should be able to see offer prices in Market View
 * Admins and super_admins can ALWAYS see prices regardless of plan
 * Paid users (connect, annual, group) can see prices
 * Free plan users (non-admin) cannot see prices
 */
export const canUserSeePrices = (
  accountPlan: string | undefined, 
  userRole?: string, 
  userAppRole?: string
): boolean => {
  // Admins and super_admins can ALWAYS see prices, regardless of plan
  if (userRole === 'admin' || userAppRole === 'super_admin') {
    return true;
  }
  // Unpaid users (free plan) cannot see prices
  // Paid users (connect, annual, group plans) can see prices
  return accountPlan !== 'free';
};
