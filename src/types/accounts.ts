// Account and subscription types for the new plan system
export type PlanType = 'free' | 'connect' | 'group';
export type AppRole = 'member' | 'manager' | 'account_admin' | 'super_admin';

export interface Account {
  id: string;
  name: string;
  plan: PlanType;
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
    description: '10 bid requests per month',
    features: ['10 bid requests/month', 'Create/edit/delete buyers', 'Basic support']
  },
  connect: {
    name: 'Connect',
    price: 100,
    description: 'Unlimited bid requests',
    features: ['Unlimited bid requests', 'Create/edit/delete buyers', 'Priority support']
  },
  group: {
    name: 'Group',
    price: 'Custom',
    description: 'Multi-user dealership management',
    features: ['Unlimited bid requests', 'Multi-user management', 'Role-based permissions', 'Dedicated support']
  }
} as const;

// Role permissions
export const ROLE_PERMISSIONS = {
  member: ['view_own_data', 'create_bid_requests', 'manage_buyers'],
  manager: ['view_own_data', 'create_bid_requests', 'manage_own_buyers'],
  account_admin: ['view_account_data', 'create_bid_requests', 'manage_all_buyers', 'manage_users', 'manage_billing'],
  super_admin: ['view_all_data', 'manage_all_accounts', 'system_admin']
} as const;