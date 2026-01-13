/**
 * Security event and session types
 * Used by useSecurityEvents hook
 */

export interface SecurityEventDetails {
  action?: string;
  resource?: string;
  previousValue?: unknown;
  newValue?: unknown;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface DeviceInfo {
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  device?: string;
  isMobile?: boolean;
  screenResolution?: string;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  details: SecurityEventDetails;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserSession {
  id: string;
  session_token: string;
  device_info: DeviceInfo;
  ip_address?: string;
  user_agent?: string;
  last_activity: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}
