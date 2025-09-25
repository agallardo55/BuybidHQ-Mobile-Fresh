/**
 * Authentication Helper Functions
 * 
 * Utility functions for role-based access control, permission checking,
 * and authentication state management.
 */

import { AuthUser, UserRole, AppRole, Permission, ROLE_PERMISSIONS, APP_ROLE_PERMISSIONS } from '@/types/auth';

/**
 * Check if user has a specific role
 */
export const hasRole = (user: AuthUser | null, role: UserRole): boolean => {
  if (!user?.app_metadata?.role) return false;
  return user.app_metadata.role === role;
};

/**
 * Check if user has a specific app role (new system)
 */
export const hasAppRole = (user: AuthUser | null, role: AppRole): boolean => {
  if (!user?.app_metadata?.app_role) return false;
  return user.app_metadata.app_role === role;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user: AuthUser | null, roles: UserRole[]): boolean => {
  if (!user?.app_metadata?.role) return false;
  return roles.includes(user.app_metadata.role);
};

/**
 * Check if user has any of the specified app roles
 */
export const hasAnyAppRole = (user: AuthUser | null, roles: AppRole[]): boolean => {
  if (!user?.app_metadata?.app_role) return false;
  return roles.includes(user.app_metadata.app_role);
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (user: AuthUser | null, permission: Permission): boolean => {
  if (!user?.app_metadata?.role) return false;
  
  const userRole = user.app_metadata.role;
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  
  return rolePermissions.includes(permission);
};

/**
 * Check if user has a specific permission (new app role system)
 */
export const hasAppPermission = (user: AuthUser | null, permission: Permission): boolean => {
  if (!user?.app_metadata?.app_role) return false;
  
  const userAppRole = user.app_metadata.app_role;
  const rolePermissions = APP_ROLE_PERMISSIONS[userAppRole] || [];
  
  return rolePermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (user: AuthUser | null, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Get all permissions for a user's role
 */
export const getUserPermissions = (user: AuthUser | null): Permission[] => {
  if (!user?.app_metadata?.role) return [];
  
  const userRole = user.app_metadata.role;
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Get all permissions for a user's app role
 */
export const getUserAppPermissions = (user: AuthUser | null): Permission[] => {
  if (!user?.app_metadata?.app_role) return [];
  
  const userAppRole = user.app_metadata.app_role;
  return APP_ROLE_PERMISSIONS[userAppRole] || [];
};

/**
 * Check if user is admin (any admin role)
 */
export const isAdmin = (user: AuthUser | null): boolean => {
  return hasAnyRole(user, ['admin', 'super_admin']);
};

/**
 * Check if user is account admin (new system)
 */
export const isAccountAdmin = (user: AuthUser | null): boolean => {
  return hasAnyAppRole(user, ['account_admin', 'super_admin']);
};

/**
 * Check if user can manage other users
 */
export const canManageUsers = (user: AuthUser | null): boolean => {
  return hasAnyPermission(user, ['manage_users', 'system_admin']);
};

/**
 * Check if user can manage buyers
 */
export const canManageBuyers = (user: AuthUser | null): boolean => {
  return hasAnyPermission(user, ['manage_buyers', 'manage_all_buyers', 'manage_own_buyers']);
};

/**
 * Check if user can create bid requests
 */
export const canCreateBidRequests = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'create_bid_requests');
};

/**
 * Check if user can view account data
 */
export const canViewAccountData = (user: AuthUser | null): boolean => {
  return hasAnyPermission(user, ['view_account_data', 'view_all_data']);
};

/**
 * Check if user belongs to the same account
 */
export const isSameAccount = (user: AuthUser | null, accountId: string): boolean => {
  if (!user?.app_metadata?.account_id) return false;
  return user.app_metadata.account_id === accountId;
};

/**
 * Check if user belongs to the same dealership
 */
export const isSameDealership = (user: AuthUser | null, dealershipId: string): boolean => {
  if (!user?.app_metadata?.dealership_id) return false;
  return user.app_metadata.dealership_id === dealershipId;
};

/**
 * Get user's display name
 */
export const getUserDisplayName = (user: AuthUser | null): string => {
  if (!user) return 'Guest';
  
  // Try user metadata first
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }
  
  // Fall back to email
  return user.email || 'User';
};

/**
 * Get user's avatar URL
 */
export const getUserAvatarUrl = (user: AuthUser | null): string | null => {
  if (!user?.user_metadata?.avatar_url) return null;
  return user.user_metadata.avatar_url;
};

/**
 * Role hierarchy for comparison (higher number = higher privilege)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  basic: 1,
  individual: 2,
  salesperson: 3,
  dealer: 4,
  admin: 5,
  super_admin: 6,
};

const APP_ROLE_HIERARCHY: Record<AppRole, number> = {
  member: 1,
  manager: 2,
  account_admin: 3,
  super_admin: 4,
};

/**
 * Check if user has higher or equal role than specified role
 */
export const hasRoleOrHigher = (user: AuthUser | null, minRole: UserRole): boolean => {
  if (!user?.app_metadata?.role) return false;
  
  const userRoleLevel = ROLE_HIERARCHY[user.app_metadata.role];
  const minRoleLevel = ROLE_HIERARCHY[minRole];
  
  return userRoleLevel >= minRoleLevel;
};

/**
 * Check if user has higher or equal app role than specified role
 */
export const hasAppRoleOrHigher = (user: AuthUser | null, minRole: AppRole): boolean => {
  if (!user?.app_metadata?.app_role) return false;
  
  const userRoleLevel = APP_ROLE_HIERARCHY[user.app_metadata.app_role];
  const minRoleLevel = APP_ROLE_HIERARCHY[minRole];
  
  return userRoleLevel >= minRoleLevel;
};

/**
 * Format role name for display
 */
export const formatRoleName = (role: UserRole | AppRole): string => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'account_admin':
      return 'Account Admin';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};