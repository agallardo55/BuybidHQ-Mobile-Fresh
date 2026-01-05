# Security Audit Log Schema

## Overview
Comprehensive security logging system to track authentication events, MFA attempts, suspicious activity, and security-relevant actions across all environments (production and development).

## Database Schema

### 1. Security Audit Logs Table

```sql
CREATE TABLE public.security_audit_logs (
  -- Identity
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Event Classification
  event_type text NOT NULL, -- 'auth', 'mfa', 'access', 'data_change', 'security_alert'
  event_action text NOT NULL, -- 'login_attempt', 'mfa_sent', 'mfa_verified', 'password_reset', etc.
  severity text NOT NULL DEFAULT 'info', -- 'debug', 'info', 'warning', 'error', 'critical'

  -- User Context
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  impersonated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- For admin impersonation

  -- Session & Request Context
  session_id text, -- Supabase session ID
  request_id text, -- Unique request identifier

  -- Network Context
  ip_address inet,
  user_agent text,
  origin text, -- Request origin URL
  referer text,

  -- Geolocation (optional, from IP)
  country_code text,
  region text,
  city text,

  -- Device Fingerprinting
  device_id text, -- Browser fingerprint or device identifier
  device_type text, -- 'desktop', 'mobile', 'tablet', 'unknown'
  browser text,
  os text,

  -- Environment
  environment text NOT NULL DEFAULT 'production', -- 'production', 'staging', 'development', 'localhost'
  hostname text, -- Server/container hostname

  -- Event Details
  resource_type text, -- 'user', 'bid_request', 'buyer', etc.
  resource_id text, -- ID of the affected resource
  action_details jsonb, -- Flexible JSON for event-specific data

  -- Success/Failure
  success boolean NOT NULL DEFAULT true,
  error_message text,
  error_code text,

  -- MFA Specific Fields
  mfa_method text, -- 'sms', 'totp', 'email', null
  mfa_phone_last4 text, -- Last 4 digits of phone for privacy
  verification_attempts integer, -- Number of attempts made

  -- Risk Assessment
  risk_score integer, -- 0-100, calculated risk score
  risk_factors jsonb, -- Array of risk indicators
  anomaly_detected boolean DEFAULT false,

  -- Compliance & Retention
  retention_period interval DEFAULT interval '7 years', -- Configurable per event type
  archived_at timestamptz,

  -- Indexes for performance
  CONSTRAINT valid_event_type CHECK (event_type IN ('auth', 'mfa', 'access', 'data_change', 'security_alert', 'admin_action')),
  CONSTRAINT valid_severity CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical'))
);

-- Indexes
CREATE INDEX idx_security_logs_user_id ON public.security_audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_security_logs_created_at ON public.security_audit_logs(created_at DESC);
CREATE INDEX idx_security_logs_event_type ON public.security_audit_logs(event_type);
CREATE INDEX idx_security_logs_severity ON public.security_audit_logs(severity) WHERE severity IN ('error', 'critical');
CREATE INDEX idx_security_logs_ip_address ON public.security_audit_logs(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX idx_security_logs_session_id ON public.security_audit_logs(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_security_logs_environment ON public.security_audit_logs(environment);
CREATE INDEX idx_security_logs_anomaly ON public.security_audit_logs(anomaly_detected) WHERE anomaly_detected = true;

-- Partial index for recent suspicious events
CREATE INDEX idx_security_logs_recent_suspicious ON public.security_audit_logs(created_at DESC, severity, success)
  WHERE created_at > now() - interval '30 days' AND (severity IN ('error', 'critical') OR success = false);

-- GIN index for JSONB search
CREATE INDEX idx_security_logs_action_details ON public.security_audit_logs USING gin(action_details);
CREATE INDEX idx_security_logs_risk_factors ON public.security_audit_logs USING gin(risk_factors);

-- Enable Row Level Security
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only super admins can view security logs
CREATE POLICY "Super admins can view all security logs"
  ON public.security_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.buybidhq_users
      WHERE id = auth.uid() AND app_role = 'super_admin'
    )
  );

-- Only system can insert logs (via service role)
CREATE POLICY "System can insert security logs"
  ON public.security_audit_logs
  FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway

-- Prevent updates and deletes (append-only)
CREATE POLICY "Prevent updates to security logs"
  ON public.security_audit_logs
  FOR UPDATE
  USING (false);

CREATE POLICY "Prevent deletes of security logs"
  ON public.security_audit_logs
  FOR DELETE
  USING (false);
```

### 2. MFA Attempt Logs Table (Denormalized for Quick Queries)

```sql
CREATE TABLE public.mfa_attempt_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,

  -- Attempt Details
  attempt_type text NOT NULL, -- 'send', 'verify'
  success boolean NOT NULL,
  error_message text,

  -- Code Details (for send attempts)
  code_sent text, -- Encrypted or hashed
  code_expires_at timestamptz,

  -- Verification Details (for verify attempts)
  code_provided text, -- Encrypted or hashed
  attempts_count integer DEFAULT 1,

  -- Context
  ip_address inet,
  user_agent text,
  session_id text,

  -- Security
  rate_limit_exceeded boolean DEFAULT false,
  suspicious_activity boolean DEFAULT false,

  CONSTRAINT valid_attempt_type CHECK (attempt_type IN ('send', 'verify'))
);

CREATE INDEX idx_mfa_attempts_user_created ON public.mfa_attempt_logs(user_id, created_at DESC);
CREATE INDEX idx_mfa_attempts_suspicious ON public.mfa_attempt_logs(suspicious_activity) WHERE suspicious_activity = true;
```

### 3. Session Activity Logs

```sql
CREATE TABLE public.session_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  session_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session Lifecycle
  event_type text NOT NULL, -- 'created', 'refreshed', 'expired', 'revoked'

  -- Context
  ip_address inet,
  user_agent text,
  device_id text,

  -- Session Details
  session_started_at timestamptz,
  session_expires_at timestamptz,
  last_activity_at timestamptz,

  -- Security Flags
  concurrent_sessions integer, -- Number of active sessions for this user
  location_changed boolean, -- IP geolocation changed
  device_changed boolean, -- Device fingerprint changed

  CONSTRAINT valid_session_event CHECK (event_type IN ('created', 'refreshed', 'expired', 'revoked', 'mfa_verified'))
);

CREATE INDEX idx_session_activity_user ON public.session_activity_logs(user_id, created_at DESC);
CREATE INDEX idx_session_activity_session ON public.session_activity_logs(session_id);
```

## Event Types & Actions

### Authentication Events (`event_type = 'auth'`)
- `login_attempt` - User attempted to sign in
- `login_success` - Successful authentication
- `login_failed` - Failed authentication
- `logout` - User signed out
- `password_change` - Password updated
- `password_reset_request` - User requested password reset
- `password_reset_complete` - Password reset completed
- `email_verification` - Email verified
- `account_locked` - Account locked due to suspicious activity
- `account_unlocked` - Account unlocked by admin

### MFA Events (`event_type = 'mfa'`)
- `mfa_code_sent` - Verification code sent
- `mfa_code_verified` - Code verified successfully
- `mfa_code_failed` - Incorrect code entered
- `mfa_code_expired` - Code expired
- `mfa_rate_limited` - Too many attempts
- `mfa_method_changed` - User changed MFA method
- `mfa_disabled` - MFA disabled for account
- `mfa_enabled` - MFA enabled for account

### Access Events (`event_type = 'access'`)
- `resource_accessed` - User accessed a resource
- `permission_denied` - Access denied
- `api_key_used` - API key authentication
- `admin_impersonation_started` - Admin started impersonating user
- `admin_impersonation_ended` - Admin stopped impersonating

### Data Change Events (`event_type = 'data_change'`)
- `record_created` - New record created
- `record_updated` - Record modified
- `record_deleted` - Record deleted
- `bulk_operation` - Bulk data operation
- `export_data` - Data exported
- `import_data` - Data imported

### Security Alert Events (`event_type = 'security_alert'`)
- `brute_force_detected` - Multiple failed login attempts
- `unusual_location` - Login from unexpected location
- `unusual_device` - Login from new device
- `concurrent_sessions_exceeded` - Too many active sessions
- `suspicious_pattern` - Anomalous behavior detected
- `sql_injection_attempt` - SQL injection detected
- `xss_attempt` - XSS attack detected
- `rate_limit_exceeded` - API rate limit exceeded

## Helper Functions

### 1. Log Security Event Function

```sql
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_event_action text,
  p_severity text DEFAULT 'info',
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL,
  p_action_details jsonb DEFAULT '{}'::jsonb,
  p_environment text DEFAULT 'production'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
  v_user_id_final uuid;
BEGIN
  -- Use provided user_id or fallback to auth.uid()
  v_user_id_final := COALESCE(p_user_id, auth.uid());

  INSERT INTO public.security_audit_logs (
    event_type,
    event_action,
    severity,
    user_id,
    session_id,
    ip_address,
    user_agent,
    success,
    error_message,
    action_details,
    environment
  ) VALUES (
    p_event_type,
    p_event_action,
    p_severity,
    v_user_id_final,
    p_session_id,
    p_ip_address,
    p_user_agent,
    p_success,
    p_error_message,
    p_action_details,
    p_environment
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;
```

### 2. Get User Security Summary

```sql
CREATE OR REPLACE FUNCTION public.get_user_security_summary(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_summary jsonb;
BEGIN
  -- Only super admins or the user themselves can view
  IF NOT (
    EXISTS (SELECT 1 FROM public.buybidhq_users WHERE id = auth.uid() AND app_role = 'super_admin')
    OR auth.uid() = p_user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'total_logins', COUNT(*) FILTER (WHERE event_action = 'login_success'),
    'failed_logins', COUNT(*) FILTER (WHERE event_action = 'login_failed'),
    'mfa_verifications', COUNT(*) FILTER (WHERE event_type = 'mfa' AND event_action = 'mfa_code_verified'),
    'last_login', MAX(created_at) FILTER (WHERE event_action = 'login_success'),
    'last_failed_login', MAX(created_at) FILTER (WHERE event_action = 'login_failed'),
    'unique_ip_addresses', COUNT(DISTINCT ip_address),
    'security_alerts', COUNT(*) FILTER (WHERE event_type = 'security_alert'),
    'recent_devices', (
      SELECT jsonb_agg(DISTINCT jsonb_build_object('device_type', device_type, 'browser', browser, 'os', os))
      FROM public.security_audit_logs
      WHERE user_id = p_user_id AND created_at > now() - interval '30 days'
    )
  ) INTO v_summary
  FROM public.security_audit_logs
  WHERE user_id = p_user_id;

  RETURN v_summary;
END;
$$;
```

### 3. Detect Suspicious Activity

```sql
CREATE OR REPLACE FUNCTION public.detect_suspicious_login(
  p_user_id uuid,
  p_ip_address inet,
  p_device_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recent_ips integer;
  v_recent_devices integer;
  v_failed_attempts integer;
  v_risk_score integer := 0;
  v_risk_factors jsonb := '[]'::jsonb;
BEGIN
  -- Check for multiple IPs in last 24 hours
  SELECT COUNT(DISTINCT ip_address) INTO v_recent_ips
  FROM public.security_audit_logs
  WHERE user_id = p_user_id
    AND created_at > now() - interval '24 hours'
    AND ip_address IS NOT NULL;

  IF v_recent_ips > 3 THEN
    v_risk_score := v_risk_score + 30;
    v_risk_factors := v_risk_factors || jsonb_build_object('factor', 'multiple_ips', 'count', v_recent_ips);
  END IF;

  -- Check for multiple devices in last 24 hours
  SELECT COUNT(DISTINCT device_id) INTO v_recent_devices
  FROM public.security_audit_logs
  WHERE user_id = p_user_id
    AND created_at > now() - interval '24 hours'
    AND device_id IS NOT NULL;

  IF v_recent_devices > 2 THEN
    v_risk_score := v_risk_score + 25;
    v_risk_factors := v_risk_factors || jsonb_build_object('factor', 'multiple_devices', 'count', v_recent_devices);
  END IF;

  -- Check for recent failed login attempts
  SELECT COUNT(*) INTO v_failed_attempts
  FROM public.security_audit_logs
  WHERE user_id = p_user_id
    AND event_action = 'login_failed'
    AND created_at > now() - interval '1 hour';

  IF v_failed_attempts >= 3 THEN
    v_risk_score := v_risk_score + 40;
    v_risk_factors := v_risk_factors || jsonb_build_object('factor', 'failed_attempts', 'count', v_failed_attempts);
  END IF;

  -- Check if IP is new
  IF NOT EXISTS (
    SELECT 1 FROM public.security_audit_logs
    WHERE user_id = p_user_id
      AND ip_address = p_ip_address
      AND created_at < now() - interval '1 day'
  ) THEN
    v_risk_score := v_risk_score + 20;
    v_risk_factors := v_risk_factors || jsonb_build_object('factor', 'new_ip');
  END IF;

  RETURN jsonb_build_object(
    'risk_score', v_risk_score,
    'risk_factors', v_risk_factors,
    'anomaly_detected', v_risk_score >= 50
  );
END;
$$;
```

## Frontend Logging Integration

### TypeScript Types

```typescript
// src/types/security-log.ts

export type SecurityEventType = 'auth' | 'mfa' | 'access' | 'data_change' | 'security_alert' | 'admin_action';
export type SecuritySeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';
export type Environment = 'production' | 'staging' | 'development' | 'localhost';

export interface SecurityLogData {
  eventType: SecurityEventType;
  eventAction: string;
  severity?: SecuritySeverity;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  origin?: string;
  referer?: string;
  deviceId?: string;
  environment?: Environment;
  resourceType?: string;
  resourceId?: string;
  actionDetails?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
  errorCode?: string;
  mfaMethod?: 'sms' | 'totp' | 'email';
  mfaPhoneLast4?: string;
}
```

### Logging Service

```typescript
// src/services/securityLogger.ts

import { supabase } from '@/integrations/supabase/client';
import { SecurityLogData, Environment } from '@/types/security-log';

class SecurityLogger {
  private deviceId: string | null = null;
  private environment: Environment;

  constructor() {
    this.environment = this.detectEnvironment();
    this.deviceId = this.getOrCreateDeviceId();
  }

  private detectEnvironment(): Environment {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'localhost';
    if (hostname.includes('staging')) return 'staging';
    if (hostname.includes('dev')) return 'development';
    return 'production';
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  private generateDeviceId(): string {
    // Simple device fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('fingerprint', 2, 2);
      const canvasData = canvas.toDataURL();
      return this.hashString(canvasData + navigator.userAgent);
    }
    return crypto.randomUUID();
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private getSessionId(): string | undefined {
    return supabase.auth.getSession().then(({ data }) => data.session?.access_token);
  }

  async log(data: SecurityLogData): Promise<void> {
    try {
      const { data: session } = await supabase.auth.getSession();

      const logEntry = {
        event_type: data.eventType,
        event_action: data.eventAction,
        severity: data.severity || 'info',
        user_id: data.userId || session?.user?.id,
        session_id: data.sessionId || session?.access_token,
        user_agent: navigator.userAgent,
        origin: window.location.origin,
        referer: document.referrer,
        device_id: this.deviceId,
        device_type: this.detectDeviceType(),
        browser: this.detectBrowser(),
        os: this.detectOS(),
        environment: data.environment || this.environment,
        resource_type: data.resourceType,
        resource_id: data.resourceId,
        action_details: data.actionDetails || {},
        success: data.success !== undefined ? data.success : true,
        error_message: data.errorMessage,
        error_code: data.errorCode,
        mfa_method: data.mfaMethod,
        mfa_phone_last4: data.mfaPhoneLast4,
      };

      // Call edge function to log (edge function will add IP address server-side)
      await supabase.functions.invoke('log-security-event', {
        body: logEntry
      });
    } catch (error) {
      // Don't throw - logging failures shouldn't break the app
      console.error('Failed to log security event:', error);
    }
  }

  private detectDeviceType(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    return 'Unknown';
  }

  private detectOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }
}

export const securityLogger = new SecurityLogger();
```

### Usage Examples

```typescript
// Login attempt
await securityLogger.log({
  eventType: 'auth',
  eventAction: 'login_attempt',
  actionDetails: { email: userEmail }
});

// Login success
await securityLogger.log({
  eventType: 'auth',
  eventAction: 'login_success',
  userId: user.id
});

// MFA code sent
await securityLogger.log({
  eventType: 'mfa',
  eventAction: 'mfa_code_sent',
  mfaMethod: 'sms',
  mfaPhoneLast4: phone.slice(-4),
  actionDetails: { phone_masked: maskPhone(phone) }
});

// Failed MFA verification
await securityLogger.log({
  eventType: 'mfa',
  eventAction: 'mfa_code_failed',
  severity: 'warning',
  success: false,
  errorMessage: 'Invalid code provided',
  actionDetails: { attempts_remaining: 3 }
});

// Suspicious activity
await securityLogger.log({
  eventType: 'security_alert',
  eventAction: 'brute_force_detected',
  severity: 'critical',
  actionDetails: {
    failed_attempts: 5,
    time_window: '5 minutes'
  }
});
```

## Data Retention & Archival

```sql
-- Auto-archive old logs
CREATE OR REPLACE FUNCTION public.archive_old_security_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Archive logs older than retention period
  UPDATE public.security_audit_logs
  SET archived_at = now()
  WHERE archived_at IS NULL
    AND created_at < (now() - retention_period);

  -- Could also move to separate archive table or cold storage
END;
$$;

-- Schedule with pg_cron (if available)
-- SELECT cron.schedule('archive-security-logs', '0 2 * * *', 'SELECT archive_old_security_logs()');
```

## Monitoring & Alerts

### Critical Events to Monitor

1. **Multiple failed logins** - Potential brute force
2. **MFA failures** - Potential account takeover
3. **New device from new location** - Potential compromise
4. **Concurrent sessions from different IPs** - Credential sharing or compromise
5. **Rapid location changes** - Impossible travel
6. **Admin actions** - Audit trail for compliance

### Alert Query Examples

```sql
-- Detect brute force attempts (5+ failed logins in 5 minutes)
SELECT user_id, ip_address, COUNT(*) as failed_count
FROM public.security_audit_logs
WHERE event_action = 'login_failed'
  AND created_at > now() - interval '5 minutes'
GROUP BY user_id, ip_address
HAVING COUNT(*) >= 5;

-- Detect impossible travel (logins from distant IPs within 1 hour)
-- Would need geolocation data

-- Detect multiple concurrent sessions
SELECT user_id, COUNT(DISTINCT session_id) as session_count
FROM public.security_audit_logs
WHERE event_type = 'auth'
  AND created_at > now() - interval '1 hour'
GROUP BY user_id
HAVING COUNT(DISTINCT session_id) > 3;
```

## Compliance & Privacy

- **PII Handling**: IP addresses and device info are logged but masked phone numbers used
- **GDPR**: User can request deletion via "right to be forgotten" (except legally required audit logs)
- **Retention**: Configurable per event type (default 7 years for compliance)
- **Access Control**: Only super admins can view full logs
- **Encryption**: Consider encrypting sensitive fields at rest

## Performance Considerations

- Partitioning by month for large datasets
- Separate hot (recent) and cold (archive) storage
- Async logging to avoid blocking user requests
- Batch inserts for high-volume events
- Regular VACUUM and ANALYZE

---

**Created**: 2026-01-04
**Version**: 1.0
**Status**: Proposal - Pending Review
