/**
 * Role-based Route Guard Hook
 * 
 * Custom hook for protecting routes based on user roles and permissions.
 * Integrates with feature flags for development flexibility.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, AppRole, Permission } from '@/types/auth';
import { 
  hasRole, 
  hasAppRole, 
  hasPermission, 
  hasAppPermission, 
  hasAnyRole, 
  hasAnyAppRole,
  hasRoleOrHigher,
  hasAppRoleOrHigher
} from '@/utils/auth-helpers';
import { shouldEnforceRoleChecks } from '@/config/features';
import { toast } from 'sonner';

interface RoleGuardOptions {
  // Required role (legacy system)
  requiredRole?: UserRole;
  // Required app role (new system)
  requiredAppRole?: AppRole;
  // Any of these roles (legacy system)
  anyOfRoles?: UserRole[];
  // Any of these app roles (new system)
  anyOfAppRoles?: AppRole[];
  // Required permission
  requiredPermission?: Permission;
  // Any of these permissions
  anyOfPermissions?: Permission[];
  // Minimum role level
  minRole?: UserRole;
  // Minimum app role level
  minAppRole?: AppRole;
  // Redirect path on access denied
  redirectTo?: string;
  // Show toast on access denied
  showToast?: boolean;
  // Custom access denied message
  accessDeniedMessage?: string;
}

interface RoleGuardResult {
  isAuthorized: boolean;
  isLoading: boolean;
  accessDenied: boolean;
}

/**
 * Hook for role-based access control
 */
export const useRoleGuard = (options: RoleGuardOptions = {}): RoleGuardResult => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [accessDenied, setAccessDenied] = useState(false);

  const {
    requiredRole,
    requiredAppRole,
    anyOfRoles,
    anyOfAppRoles,
    requiredPermission,
    anyOfPermissions,
    minRole,
    minAppRole,
    redirectTo = '/dashboard',
    showToast = true,
    accessDeniedMessage = 'You do not have permission to access this resource.'
  } = options;

  // Check if role enforcement is enabled
  const shouldEnforce = shouldEnforceRoleChecks();

  const checkAccess = (): boolean => {
    // If role enforcement is disabled (development), allow access
    if (!shouldEnforce) {
      return true;
    }

    // User must be authenticated
    if (!user) {
      return false;
    }

    // Check specific role requirement
    if (requiredRole && !hasRole(user, requiredRole)) {
      return false;
    }

    // Check specific app role requirement  
    if (requiredAppRole && !hasAppRole(user, requiredAppRole)) {
      return false;
    }

    // Check if user has any of the specified roles
    if (anyOfRoles && !hasAnyRole(user, anyOfRoles)) {
      return false;
    }

    // Check if user has any of the specified app roles
    if (anyOfAppRoles && !hasAnyAppRole(user, anyOfAppRoles)) {
      return false;
    }

    // Check specific permission requirement
    if (requiredPermission && !hasPermission(user, requiredPermission)) {
      return false;
    }

    // Check if user has any of the specified permissions
    if (anyOfPermissions && !anyOfPermissions.some(permission => hasPermission(user, permission))) {
      return false;
    }

    // Check minimum role level
    if (minRole && !hasRoleOrHigher(user, minRole)) {
      return false;
    }

    // Check minimum app role level
    if (minAppRole && !hasAppRoleOrHigher(user, minAppRole)) {
      return false;
    }

    return true;
  };

  const isAuthorized = checkAccess();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthorized) {
      setAccessDenied(true);
      
      if (showToast) {
        toast.error(accessDeniedMessage);
      }
      
      // Redirect after a short delay to allow toast to show
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1000);
    } else {
      setAccessDenied(false);
    }
  }, [isAuthorized, authLoading, navigate, redirectTo, showToast, accessDeniedMessage]);

  return {
    isAuthorized,
    isLoading: authLoading,
    accessDenied
  };
};

/**
 * Higher-order component for role-based route protection
 */
export const withRoleGuard = <P extends Record<string, any>>(
  Component: React.ComponentType<P>, 
  options: RoleGuardOptions = {}
) => {
  return function ProtectedComponent(props: P) {
    const { isAuthorized, isLoading, accessDenied } = useRoleGuard(options);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (accessDenied) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You do not have permission to access this page.</p>
          </div>
        </div>
      );
    }

    if (!isAuthorized) {
      return null;
    }

    return <Component {...props} />;
  };
};

/**
 * Convenience hooks for common role checks
 */

export const useAdminGuard = (redirectTo?: string) => {
  return useRoleGuard({
    anyOfRoles: ['admin', 'super_admin'],
    redirectTo,
    accessDeniedMessage: 'Admin access required.'
  });
};

export const useAccountAdminGuard = (redirectTo?: string) => {
  return useRoleGuard({
    anyOfAppRoles: ['account_admin', 'super_admin'],
    redirectTo,
    accessDeniedMessage: 'Account admin access required.'
  });
};

export const useDealerGuard = (redirectTo?: string) => {
  return useRoleGuard({
    anyOfAppRoles: ['account_admin', 'super_admin'],
    redirectTo,
    accessDeniedMessage: 'Account admin access required.'
  });
};

export const useManagerGuard = (redirectTo?: string) => {
  return useRoleGuard({
    minAppRole: 'manager',
    redirectTo,
    accessDeniedMessage: 'Manager access required.'
  });
};

export const useBidRequestPermission = () => {
  return useRoleGuard({
    requiredPermission: 'create_bid_requests',
    showToast: false
  });
};

export const useBuyerManagementPermission = () => {
  return useRoleGuard({
    anyOfPermissions: ['manage_buyers', 'manage_all_buyers', 'manage_own_buyers'],
    showToast: false
  });
};