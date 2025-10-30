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



