
// This file manages feature flags and development settings
// Set this to true when deploying to production
const isProduction = false;

export const shouldEnforceRoleChecks = () => {
  return isProduction;
};

export const hasRequiredRole = (userRole?: string) => {
  if (!shouldEnforceRoleChecks()) {
    return true; // In development, always return true
  }
  return userRole === 'admin' || userRole === 'dealer';
};

