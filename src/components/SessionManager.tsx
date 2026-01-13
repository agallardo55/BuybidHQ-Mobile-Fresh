import { useSessionExpiration } from '@/hooks/useSessionExpiration';

/**
 * Component that manages session expiration
 * Must be inside AuthProvider to access user
 */
export const SessionManager = () => {
  useSessionExpiration();
  return null;
};
