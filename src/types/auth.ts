/**
 * Authentication and Authorization Types
 * 
 * This file defines the core authentication types for BuybidHQ,
 * including user roles, permissions, and auth state management.
 */

// Base auth types extending Supabase auth
import { User, Session } from '@supabase/supabase-js';

// Application-specific user roles (dealer consolidated to basic+account_admin)
export type UserRole = 'basic' | 'individual' | 'associate' | 'salesperson' | 'manager' | 'admin' | 'super_admin';

// Application-specific app roles for new system
export type AppRole = 'member' | 'manager' | 'account_admin' | 'super_admin';

// Role-based permissions
export type Permission = 
  | 'view_own_data'
  | 'create_bid_requests' 
  | 'manage_buyers'
  | 'manage_own_buyers'
  | 'manage_own_dealership'
  | 'view_account_data'
  | 'manage_all_buyers'
  | 'manage_users'
  | 'manage_billing'
  | 'view_all_data'
  | 'manage_all_accounts'
  | 'system_admin';

// Enhanced user interface with role information
export interface AuthUser extends User {
  app_metadata: {
    role?: UserRole;
    app_role?: AppRole;
    account_id?: string;
    dealership_id?: string;
  };
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

// Auth context state
export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
}

// Role-based access control helpers
export interface RolePermissions {
  [key: string]: Permission[];
}

export const ROLE_PERMISSIONS: RolePermissions = {
  basic: ['view_own_data', 'create_bid_requests'],
  individual: ['view_own_data', 'create_bid_requests', 'manage_buyers'],
  associate: ['view_own_data', 'create_bid_requests'],
  salesperson: ['view_own_data', 'create_bid_requests'],
  manager: ['view_own_data', 'create_bid_requests', 'manage_buyers'],
  admin: ['view_account_data', 'create_bid_requests', 'manage_all_buyers', 'manage_users'],
  super_admin: ['view_all_data', 'manage_all_accounts', 'system_admin']
} as const;

// App role permissions for new system
export const APP_ROLE_PERMISSIONS: RolePermissions = {
  member: ['view_own_data', 'create_bid_requests', 'manage_own_buyers', 'manage_own_dealership'],
  manager: ['view_own_data', 'create_bid_requests', 'manage_own_buyers'],
  account_admin: ['view_account_data', 'create_bid_requests', 'manage_all_buyers', 'manage_users', 'manage_billing'],
  super_admin: ['view_all_data', 'manage_all_accounts', 'system_admin']
} as const;

// Auth action types for useReducer pattern (future enhancement)
export type AuthAction = 
  | { type: 'SIGN_IN'; payload: { user: AuthUser; session: Session } }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'REFRESH_SESSION'; payload: Session }
  | { type: 'UPDATE_USER'; payload: Partial<AuthUser> };

// Email confirmation types (scaffolding)
// TODO: Enhance email confirmation flow
export interface EmailConfirmation {
  required: boolean;
  sent_at?: string;
  confirmed_at?: string;
  resend_available: boolean;
}

// Password reset types
export interface PasswordReset {
  token_valid: boolean;
  expires_at?: string;
  user_id?: string;
}

// Auth form validation types
export interface AuthFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export interface SignInFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  terms_accepted: boolean;
}