// Account and subscription types for the new plan system
export type PlanType = 'free' | 'connect' | 'annual';
export type AppRole = 'member' | 'manager' | 'account_admin' | 'super_admin';

export interface Account {
  id: string;
  name: string;
  plan: PlanType;
  billing_cycle: 'monthly' | 'annual' | null;
  seat_limit: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  billing_status: string;
  feature_group_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface BidRequestLimit {
  allowed: boolean;
  remaining?: number;
  reason?: 'FREE_LIMIT_REACHED';
}

// Plan display information
export const PLAN_INFO = {
  free: {
    name: 'Free',
    price: 0,
    description: 'Unlimited bid requests',
    features: ['Unlimited bid requests', 'Create/edit/delete buyers', 'Basic support']
  },
  connect: {
    name: 'Connect',
    price: 99,
    description: 'Unlimited bid requests',
    features: ['Unlimited bid requests', 'Create/edit/delete buyers', 'Priority support']
  },
  annual: {
    name: 'Annual',
    price: 599,
    description: 'Unlimited bid requests - Annual billing',
    features: ['Unlimited bid requests', 'Create/edit/delete buyers', 'Priority support', 'Annual billing discount']
  }
} as const;

// Role permissions
export const ROLE_PERMISSIONS = {
  member: ['view_own_data', 'create_bid_requests', 'manage_own_buyers', 'manage_own_dealership'],
  manager: ['view_own_data', 'create_bid_requests', 'manage_own_buyers'],
  account_admin: ['view_account_data', 'create_bid_requests', 'manage_all_buyers', 'manage_users', 'manage_billing'],
  super_admin: ['view_all_data', 'manage_all_accounts', 'system_admin']
} as const;