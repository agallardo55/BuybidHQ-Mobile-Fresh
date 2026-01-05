# MFA Workflow Analysis & Recommendations

## Executive Summary

This document analyzes the current MFA implementation in BuyBidHQ and proposes an improved architecture following industry best practices for authentication security.

**Current Status**: Basic 24-hour SMS MFA with known security gaps
**Recommendation**: Multi-layered adaptive authentication with risk-based MFA
**Priority**: High - Current implementation has user experience and security issues

---

## Part 1: Current MFA Workflow

### Architecture Overview

```
┌─────────────┐
│   User      │
│  Sign In    │
└──────┬──────┘
       │
       v
┌─────────────────────┐
│ supabase.auth       │
│ .signInWithPassword │
└──────┬──────────────┘
       │
       v
┌──────────────────────┐      YES     ┌─────────────────┐
│ needs_daily_mfa()    │────────────>│  Redirect to    │
│ Check if 24hrs passed│              │  /auth/mfa      │
└──────┬───────────────┘              └────────┬────────┘
       │ NO                                     │
       │                                        v
       v                                 ┌─────────────────┐
┌──────────────────┐                    │ Auto-send SMS   │
│  Navigate to     │                    │  (via Edge Fn)  │
│   /dashboard     │                    └────────┬────────┘
└──────────────────┘                             │
                                                 v
                                          ┌──────────────┐
                                          │  User enters │
                                          │     code     │
                                          └──────┬───────┘
                                                 │
                                                 v
                                          ┌──────────────────┐
                                          │ verify-mfa-code  │
                                          │   Edge Function  │
                                          └──────┬───────────┘
                                                 │
                              ┌──────────────────┴────────────────┐
                              │                                   │
                          SUCCESS                               FAIL
                              │                                   │
                              v                                   v
                   ┌──────────────────────┐           ┌─────────────────┐
                   │ record_mfa_          │           │ Increment       │
                   │ verification()       │           │ attempts        │
                   └──────┬───────────────┘           └─────────────────┘
                          │                                   │
                          v                                   v
                   ┌──────────────────┐              ┌────────────────┐
                   │  Navigate to     │              │ Show error,    │
                   │   /dashboard     │              │ retry (max 5)  │
                   └──────────────────┘              └────────────────┘
```

### Database Schema (Current)

#### 1. sms_verification_codes

```sql
CREATE TABLE public.sms_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,              -- Plain text 6-digit code
  phone_number text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  attempts integer DEFAULT 0,

  UNIQUE(user_id, verified)        -- Only one unverified code per user
);
```

#### 2. mfa_daily_verification

```sql
CREATE TABLE public.mfa_daily_verification (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### needs_daily_mfa() Function (Current)

```sql
CREATE FUNCTION public.needs_daily_mfa()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_verified timestamptz;
  v_hours_elapsed numeric;
  v_user_phone text;
BEGIN
  -- Check auth.users.phone first
  SELECT phone INTO v_user_phone
  FROM auth.users
  WHERE id = auth.uid();

  -- Fallback to buybidhq_users.mobile_number
  IF v_user_phone IS NULL THEN
    SELECT mobile_number INTO v_user_phone
    FROM public.buybidhq_users
    WHERE id = auth.uid();
  END IF;

  -- No phone = no MFA required
  IF v_user_phone IS NULL THEN
    RETURN false;
  END IF;

  -- Get last verification time
  SELECT last_verified_at INTO v_last_verified
  FROM public.mfa_daily_verification
  WHERE user_id = auth.uid();

  -- Never verified = needs MFA
  IF v_last_verified IS NULL THEN
    RETURN true;
  END IF;

  -- Calculate hours elapsed
  v_hours_elapsed := EXTRACT(EPOCH FROM (now() - v_last_verified)) / 3600;

  -- Return true if 24+ hours
  RETURN v_hours_elapsed >= 24;
END;
$$;
```

### Trigger Points (Current)

1. **Sign In** (SignIn.tsx:78)
   - After successful password authentication
   - Calls `needs_daily_mfa()`

2. **Protected Routes** (ProtectedRoute.tsx:26)
   - EVERY protected route navigation
   - Calls `needs_daily_mfa()` on mount
   - Re-checks on pathname change

3. **MFA Challenge Page** (MFAChallenge.tsx:65)
   - Auto-sends code on page load
   - Uses ref to prevent duplicate sends in dev mode
   - SessionStorage prevents resend on refresh

### Issues with Current Implementation

#### 1. **Security Issues**

| Issue | Impact | Severity |
|-------|--------|----------|
| Plain text code storage | Codes visible in database | HIGH |
| SMS-only MFA | Vulnerable to SIM swapping | MEDIUM |
| No rate limiting on sends | SMS bombing possible | MEDIUM |
| No device binding | Can't detect device changes | LOW |
| No session fingerprinting | Can't detect hijacking | MEDIUM |
| Checks on EVERY route change | Performance impact | LOW |
| 24-hour window too long | Compromised tokens valid 24hrs | MEDIUM |
| No step-up authentication | Can't require MFA for sensitive actions | MEDIUM |

#### 2. **User Experience Issues**

| Issue | Impact | Severity |
|-------|--------|----------|
| MFA required every 24 hours regardless of context | Annoying for trusted devices | HIGH |
| Auto-send on page load | Can't control when code is sent | MEDIUM |
| Checks on every route change | Unnecessary database calls | MEDIUM |
| 15-minute session timeout on MFA page | Too aggressive | MEDIUM |
| No "Trust this device" option | Repeat MFA on same device | HIGH |
| React Strict Mode double-send issue | Requires workarounds | LOW |

#### 3. **Operational Issues**

| Issue | Impact | Cost |
|-------|--------|------|
| SMS costs add up | $0.0083 per code | MEDIUM |
| No audit trail for MFA events | Can't investigate suspicious activity | HIGH |
| No monitoring/alerts | Can't detect attacks | HIGH |
| Phone number split across tables | Confusing data model | LOW |

### Code Smells & Technical Debt

```typescript
// MFAChallenge.tsx - Multiple anti-patterns

// 1. Using refs to prevent double-execution (React Strict Mode workaround)
const hasSentCodeRef = useRef(false);
const isVerifyingRef = useRef(false);

// 2. SessionStorage hacks to prevent resend on refresh
const sessionKey = 'mfa_code_sent_timestamp';
const lastSentTime = sessionStorage.getItem(sessionKey);

// 3. Auto-send on mount (no user control)
useEffect(() => {
  if (!hasSentCodeRef.current) {
    handleSendCode();
  }
}, []);

// 4. Hardcoded 30-second resend cooldown
const minResendInterval = 30 * 1000;

// 5. Hardcoded 15-minute session timeout
const [timeRemaining, setTimeRemaining] = useState(15 * 60);
```

---

## Part 2: Industry Best Practices

### NIST Digital Identity Guidelines (SP 800-63B)

1. **Authenticator Assurance Levels (AAL)**
   - AAL1: Single-factor (password)
   - AAL2: Two-factor or cryptographic
   - AAL3: Hardware-based cryptographic

2. **Out-of-Band Authenticators** (SMS)
   - Restricted due to SIM swapping risks
   - Should not be used alone for high-value transactions
   - Recommend TOTP or WebAuthn instead

3. **Memorized Secret Verifiers**
   - Minimum 8 characters
   - Check against breach databases
   - Rate limiting on failed attempts

### OAuth 2.0 / OIDC Standards

1. **PKCE** (Proof Key for Code Exchange)
   - Prevent authorization code interception

2. **Token Binding**
   - Bind tokens to TLS connections

3. **Device Authorization Grant**
   - For device-specific flows

### Microsoft's Adaptive Authentication

1. **Risk Signals**
   - IP reputation
   - Geo-velocity (impossible travel)
   - Device fingerprint
   - Behavioral biometrics

2. **Adaptive Policies**
   - Require MFA for new device
   - Require MFA for high-risk sign-in
   - Block sign-in from suspicious location

3. **Conditional Access**
   - Device compliance
   - Network location
   - App sensitivity

### Google's Risk-Based Authentication

1. **Sign-in Challenge**
   - Familiar vs. unfamiliar device
   - Expected vs. unexpected location
   - Normal vs. anomalous behavior

2. **Device Trust**
   - Registered devices skip MFA
   - New device always requires MFA

3. **Session Management**
   - Shorter sessions for unmanaged devices
   - Longer sessions for corporate devices

---

## Part 3: Proposed MFA Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────┐
│                      Sign-In Flow                               │
└─────────────────────────────────────────────────────────────────┘

1. User enters credentials
   │
   v
2. Password authentication
   │
   v
3. Risk assessment
   │
   ├─ Low Risk ────────────> Grant access (no MFA)
   │
   ├─ Medium Risk ────────> Require MFA (SMS or TOTP)
   │
   └─ High Risk ──────────> Block + alert

┌─────────────────────────────────────────────────────────────────┐
│                    Risk Assessment Factors                      │
└─────────────────────────────────────────────────────────────────┘

• Device Recognition
  - Known device fingerprint ✓ Low Risk
  - Unknown device ⚠ High Risk

• Location Analysis
  - Expected country/region ✓ Low Risk
  - New country ⚠ Medium Risk
  - Geo-velocity impossible travel 🚨 High Risk

• IP Reputation
  - Residential IP ✓ Low Risk
  - VPN/Proxy ⚠ Medium Risk
  - Known bot/attacker IP 🚨 High Risk

• Behavioral Patterns
  - Normal login time ✓ Low Risk
  - Unusual time (3am) ⚠ Medium Risk
  - Multiple failed attempts 🚨 High Risk

• Session Context
  - Single active session ✓ Low Risk
  - Multiple concurrent sessions ⚠ Medium Risk
  - 5+ sessions from different IPs 🚨 High Risk

┌─────────────────────────────────────────────────────────────────┐
│                    MFA Methods (Priority Order)                 │
└─────────────────────────────────────────────────────────────────┘

1. **WebAuthn / Passkeys** (Highest Security)
   - Hardware security keys (YubiKey)
   - Platform authenticators (Touch ID, Face ID)
   - Phishing-resistant

2. **TOTP** (High Security, Low Cost)
   - Time-based one-time passwords
   - Authenticator apps (Google, Authy)
   - Works offline

3. **SMS** (Fallback Only)
   - Vulnerable to SIM swapping
   - Should be discouraged
   - Use only when no other method available

4. **Email** (Backup Recovery)
   - For account recovery only
   - Not primary MFA method

┌─────────────────────────────────────────────────────────────────┐
│                    Device Trust Model                           │
└─────────────────────────────────────────────────────────────────┘

Trusted Device:
  → Registered device
  → Verified with MFA initially
  → Device fingerprint stored
  → MFA required every 30 days

Untrusted Device:
  → New/unknown device
  → MFA required EVERY sign-in
  → Can be trusted after verification
  → Shorter session duration (1 hour)

Managed Device (Enterprise):
  → Company-owned device
  → MDM enrolled
  → MFA required every 90 days
  → Full access to resources
```

### Proposed Database Schema

#### 1. Enhanced User Authentication Table

```sql
CREATE TABLE public.user_authentication (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- MFA Configuration
  mfa_enabled boolean NOT NULL DEFAULT true,
  mfa_required boolean NOT NULL DEFAULT false, -- Admin can force
  primary_mfa_method text, -- 'totp', 'webauthn', 'sms', null

  -- Backup methods
  backup_methods jsonb DEFAULT '[]'::jsonb, -- ['sms', 'email']

  -- TOTP Settings
  totp_secret text, -- Encrypted
  totp_enabled boolean DEFAULT false,
  totp_verified_at timestamptz,

  -- WebAuthn Settings
  webauthn_enabled boolean DEFAULT false,

  -- SMS Settings
  sms_phone_number text, -- Encrypted
  sms_verified boolean DEFAULT false,
  sms_verified_at timestamptz,

  -- Email Settings
  recovery_email text, -- Encrypted
  recovery_email_verified boolean DEFAULT false,

  -- Risk & Trust
  risk_level text DEFAULT 'low', -- 'low', 'medium', 'high'
  last_risk_assessment timestamptz,

  CONSTRAINT valid_primary_mfa CHECK (primary_mfa_method IN ('totp', 'webauthn', 'sms', NULL))
);

CREATE INDEX idx_user_auth_user_id ON public.user_authentication(user_id);
```

#### 2. Trusted Devices

```sql
CREATE TABLE public.trusted_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Device Identification
  device_fingerprint text NOT NULL UNIQUE, -- SHA-256 hash
  device_name text, -- "John's iPhone"
  device_type text, -- 'desktop', 'mobile', 'tablet'
  browser text,
  os text,

  -- Trust Status
  trusted boolean NOT NULL DEFAULT false,
  trust_granted_at timestamptz,
  trust_expires_at timestamptz, -- NULL = never expires
  last_used_at timestamptz,

  -- Location (first seen)
  first_ip inet,
  first_country_code text,
  first_city text,

  -- Security
  revoked boolean DEFAULT false,
  revoked_at timestamptz,
  revoked_reason text,

  -- MFA History for this device
  mfa_verifications_count integer DEFAULT 0,
  last_mfa_at timestamptz,

  CONSTRAINT unique_user_device UNIQUE(user_id, device_fingerprint)
);

CREATE INDEX idx_trusted_devices_user ON public.trusted_devices(user_id) WHERE revoked = false;
CREATE INDEX idx_trusted_devices_fingerprint ON public.trusted_devices(device_fingerprint) WHERE revoked = false;
CREATE INDEX idx_trusted_devices_expires ON public.trusted_devices(trust_expires_at) WHERE trusted = true AND revoked = false;
```

#### 3. MFA Challenges

```sql
CREATE TABLE public.mfa_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  device_fingerprint text,

  -- Challenge Details
  challenge_type text NOT NULL, -- 'totp', 'webauthn', 'sms', 'email'
  challenge_reason text NOT NULL, -- 'sign_in', 'step_up', 'recovery', 'new_device'
  challenge_code text, -- Encrypted, for SMS/Email
  challenge_data jsonb, -- WebAuthn challenge, etc.

  -- Status
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'expired', 'failed'
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 5,

  -- Timing
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,

  -- Context
  ip_address inet,
  user_agent text,
  risk_score integer, -- 0-100

  -- Rate Limiting
  send_count integer DEFAULT 1, -- Number of times code was sent
  last_send_at timestamptz DEFAULT now(),

  CONSTRAINT valid_challenge_type CHECK (challenge_type IN ('totp', 'webauthn', 'sms', 'email')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'verified', 'expired', 'failed', 'rate_limited'))
);

CREATE INDEX idx_mfa_challenges_user ON public.mfa_challenges(user_id, created_at DESC);
CREATE INDEX idx_mfa_challenges_session ON public.mfa_challenges(session_id) WHERE status = 'pending';
CREATE INDEX idx_mfa_challenges_expired ON public.mfa_challenges(expires_at) WHERE status = 'pending';
```

#### 4. WebAuthn Credentials

```sql
CREATE TABLE public.webauthn_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Credential Details
  credential_id text NOT NULL UNIQUE, -- Base64 encoded
  public_key text NOT NULL, -- Base64 encoded
  counter bigint NOT NULL DEFAULT 0, -- Clone detection

  -- Authenticator Info
  authenticator_guid text, -- AAGUID
  authenticator_name text, -- "YubiKey 5", "Touch ID"
  transports text[], -- ['usb', 'nfc', 'ble', 'internal']

  -- Device Binding
  device_fingerprint text,

  -- Status
  enabled boolean DEFAULT true,
  last_used_at timestamptz,

  -- Backup & Recovery
  is_backup_eligible boolean DEFAULT false,
  is_backup_state boolean DEFAULT false
);

CREATE INDEX idx_webauthn_user ON public.webauthn_credentials(user_id) WHERE enabled = true;
CREATE INDEX idx_webauthn_credential ON public.webauthn_credentials(credential_id);
```

#### 5. Risk Assessment Log

```sql
CREATE TABLE public.authentication_risk_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,

  -- Risk Calculation
  risk_score integer NOT NULL, -- 0-100
  risk_level text NOT NULL, -- 'low', 'medium', 'high', 'critical'
  risk_factors jsonb NOT NULL, -- Array of contributing factors

  -- Context
  ip_address inet,
  device_fingerprint text,
  location_data jsonb, -- {country, city, lat, lon}

  -- Decision
  decision text NOT NULL, -- 'allow', 'mfa_required', 'block'
  decision_reason text,

  CONSTRAINT valid_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_decision CHECK (decision IN ('allow', 'mfa_required', 'step_up', 'block'))
);

CREATE INDEX idx_risk_log_user ON public.authentication_risk_log(user_id, created_at DESC);
CREATE INDEX idx_risk_log_high_risk ON public.authentication_risk_log(risk_level) WHERE risk_level IN ('high', 'critical');
```

### Core Functions

#### 1. Calculate Authentication Risk

```sql
CREATE OR REPLACE FUNCTION public.calculate_auth_risk(
  p_user_id uuid,
  p_ip_address inet,
  p_device_fingerprint text,
  p_session_context jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_risk_score integer := 0;
  v_risk_factors jsonb := '[]'::jsonb;
  v_risk_level text;
  v_is_trusted_device boolean;
  v_is_new_location boolean;
  v_failed_attempts_1h integer;
  v_concurrent_sessions integer;
  v_last_login_ip inet;
  v_decision text;
BEGIN
  -- Check if device is trusted
  SELECT trusted INTO v_is_trusted_device
  FROM public.trusted_devices
  WHERE user_id = p_user_id
    AND device_fingerprint = p_device_fingerprint
    AND revoked = false
    AND (trust_expires_at IS NULL OR trust_expires_at > now())
  LIMIT 1;

  IF v_is_trusted_device IS NULL OR v_is_trusted_device = false THEN
    v_risk_score := v_risk_score + 30;
    v_risk_factors := v_risk_factors || jsonb_build_object(
      'factor', 'unknown_device',
      'weight', 30,
      'description', 'Sign-in from unrecognized device'
    );
  END IF;

  -- Check for new IP/location
  SELECT ip_address INTO v_last_login_ip
  FROM public.security_audit_logs
  WHERE user_id = p_user_id
    AND event_action = 'login_success'
    AND ip_address IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_login_ip IS NOT NULL AND v_last_login_ip != p_ip_address THEN
    v_risk_score := v_risk_score + 20;
    v_risk_factors := v_risk_factors || jsonb_build_object(
      'factor', 'new_ip_address',
      'weight', 20,
      'description', 'Sign-in from different IP than previous session'
    );
  END IF;

  -- Check failed login attempts in last hour
  SELECT COUNT(*) INTO v_failed_attempts_1h
  FROM public.security_audit_logs
  WHERE user_id = p_user_id
    AND event_action = 'login_failed'
    AND created_at > now() - interval '1 hour';

  IF v_failed_attempts_1h >= 3 THEN
    v_risk_score := v_risk_score + 40;
    v_risk_factors := v_risk_factors || jsonb_build_object(
      'factor', 'multiple_failed_attempts',
      'weight', 40,
      'count', v_failed_attempts_1h,
      'description', format('%s failed login attempts in last hour', v_failed_attempts_1h)
    );
  END IF;

  -- Check concurrent sessions
  SELECT COUNT(DISTINCT session_id) INTO v_concurrent_sessions
  FROM public.security_audit_logs
  WHERE user_id = p_user_id
    AND event_type = 'auth'
    AND created_at > now() - interval '1 hour';

  IF v_concurrent_sessions > 3 THEN
    v_risk_score := v_risk_score + 25;
    v_risk_factors := v_risk_factors || jsonb_build_object(
      'factor', 'multiple_concurrent_sessions',
      'weight', 25,
      'count', v_concurrent_sessions,
      'description', format('%s concurrent sessions detected', v_concurrent_sessions)
    );
  END IF;

  -- TODO: Add more risk factors
  -- - Geo-velocity (impossible travel)
  -- - Time of day (unusual hours)
  -- - IP reputation check
  -- - Leaked credential check

  -- Determine risk level and decision
  IF v_risk_score >= 70 THEN
    v_risk_level := 'critical';
    v_decision := 'block';
  ELSIF v_risk_score >= 50 THEN
    v_risk_level := 'high';
    v_decision := 'mfa_required';
  ELSIF v_risk_score >= 25 THEN
    v_risk_level := 'medium';
    v_decision := 'mfa_required';
  ELSE
    v_risk_level := 'low';
    v_decision := v_is_trusted_device = true ? 'allow' : 'mfa_required';
  END IF;

  -- Log the risk assessment
  INSERT INTO public.authentication_risk_log (
    user_id, session_id, risk_score, risk_level, risk_factors,
    ip_address, device_fingerprint, decision
  ) VALUES (
    p_user_id,
    p_session_context->>'session_id',
    v_risk_score,
    v_risk_level,
    v_risk_factors,
    p_ip_address,
    p_device_fingerprint,
    v_decision
  );

  RETURN jsonb_build_object(
    'risk_score', v_risk_score,
    'risk_level', v_risk_level,
    'risk_factors', v_risk_factors,
    'decision', v_decision,
    'is_trusted_device', COALESCE(v_is_trusted_device, false)
  );
END;
$$;
```

#### 2. Trust Device

```sql
CREATE OR REPLACE FUNCTION public.trust_device(
  p_user_id uuid,
  p_device_fingerprint text,
  p_device_name text DEFAULT NULL,
  p_trust_duration interval DEFAULT interval '30 days'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_device_id uuid;
BEGIN
  -- Only user or admin can trust device
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Upsert trusted device
  INSERT INTO public.trusted_devices (
    user_id,
    device_fingerprint,
    device_name,
    trusted,
    trust_granted_at,
    trust_expires_at,
    last_used_at
  ) VALUES (
    p_user_id,
    p_device_fingerprint,
    p_device_name,
    true,
    now(),
    now() + p_trust_duration,
    now()
  )
  ON CONFLICT (user_id, device_fingerprint)
  DO UPDATE SET
    trusted = true,
    trust_granted_at = now(),
    trust_expires_at = now() + p_trust_duration,
    last_used_at = now(),
    revoked = false,
    updated_at = now()
  RETURNING id INTO v_device_id;

  RETURN v_device_id;
END;
$$;
```

#### 3. Create MFA Challenge

```sql
CREATE OR REPLACE FUNCTION public.create_mfa_challenge(
  p_user_id uuid,
  p_challenge_type text,
  p_challenge_reason text,
  p_device_fingerprint text DEFAULT NULL,
  p_session_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge_id uuid;
  v_challenge_code text;
  v_phone_number text;
  v_expires_at timestamptz;
BEGIN
  -- Generate challenge based on type
  CASE p_challenge_type
    WHEN 'sms' THEN
      -- Generate 6-digit code
      v_challenge_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
      v_expires_at := now() + interval '10 minutes';

      -- Get phone number
      SELECT sms_phone_number INTO v_phone_number
      FROM public.user_authentication
      WHERE user_id = p_user_id;

      IF v_phone_number IS NULL THEN
        RAISE EXCEPTION 'No phone number configured for user';
      END IF;

    WHEN 'totp' THEN
      v_expires_at := now() + interval '5 minutes';
      -- TOTP doesn't need stored code

    WHEN 'webauthn' THEN
      v_expires_at := now() + interval '5 minutes';
      -- WebAuthn challenge generated client-side

    ELSE
      RAISE EXCEPTION 'Invalid challenge type: %', p_challenge_type;
  END CASE;

  -- Create challenge record
  INSERT INTO public.mfa_challenges (
    user_id,
    session_id,
    device_fingerprint,
    challenge_type,
    challenge_reason,
    challenge_code,
    expires_at
  ) VALUES (
    p_user_id,
    p_session_id,
    p_device_fingerprint,
    p_challenge_type,
    p_challenge_reason,
    v_challenge_code, -- Will be encrypted by trigger
    v_expires_at
  )
  RETURNING id INTO v_challenge_id;

  RETURN jsonb_build_object(
    'challenge_id', v_challenge_id,
    'challenge_type', p_challenge_type,
    'expires_at', v_expires_at,
    'phone_number', v_phone_number
  );
END;
$$;
```

### Frontend Integration

#### New Auth Flow

```typescript
// src/services/adaptiveAuth.ts

import { supabase } from '@/integrations/supabase/client';
import { securityLogger } from '@/services/securityLogger';

export interface AuthRiskAssessment {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
  decision: 'allow' | 'mfa_required' | 'step_up' | 'block';
  isTrustedDevice: boolean;
}

export class AdaptiveAuthService {
  async signIn(email: string, password: string): Promise<{
    success: boolean;
    requiresMFA: boolean;
    riskAssessment?: AuthRiskAssessment;
    session?: any;
  }> {
    try {
      // 1. Authenticate with password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        await securityLogger.log({
          eventType: 'auth',
          eventAction: 'login_failed',
          severity: 'warning',
          success: false,
          errorMessage: authError?.message
        });
        return { success: false, requiresMFA: false };
      }

      // 2. Calculate risk score
      const deviceFingerprint = await this.getDeviceFingerprint();

      const { data: riskData } = await supabase.rpc('calculate_auth_risk', {
        p_user_id: authData.user.id,
        p_ip_address: null, // Will be detected server-side
        p_device_fingerprint: deviceFingerprint,
        p_session_context: {
          session_id: authData.session?.access_token
        }
      });

      const riskAssessment: AuthRiskAssessment = riskData;

      // 3. Handle based on risk decision
      switch (riskAssessment.decision) {
        case 'block':
          await supabase.auth.signOut();
          await securityLogger.log({
            eventType: 'security_alert',
            eventAction: 'sign_in_blocked',
            severity: 'critical',
            actionDetails: { risk_assessment: riskAssessment }
          });
          return { success: false, requiresMFA: false, riskAssessment };

        case 'mfa_required':
        case 'step_up':
          await securityLogger.log({
            eventType: 'auth',
            eventAction: 'mfa_required',
            severity: 'info',
            actionDetails: { risk_assessment: riskAssessment }
          });
          return {
            success: true,
            requiresMFA: true,
            riskAssessment,
            session: authData.session
          };

        case 'allow':
          await securityLogger.log({
            eventType: 'auth',
            eventAction: 'login_success',
            severity: 'info'
          });
          return {
            success: true,
            requiresMFA: false,
            riskAssessment,
            session: authData.session
          };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, requiresMFA: false };
    }
  }

  async getDeviceFingerprint(): Promise<string> {
    // Use FingerprintJS or similar
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage
    ];

    const fingerprint = components.join('|');
    return await this.hashString(fingerprint);
  }

  private async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

export const adaptiveAuth = new AdaptiveAuthService();
```

---

## Part 4: Migration Plan

### Phase 1: Foundation (Week 1-2)

1. **Add Security Logging**
   - Implement security_audit_logs table
   - Create log_security_event function
   - Add frontend securityLogger service
   - Start logging all auth events

2. **Device Fingerprinting**
   - Add device fingerprint generation
   - Create trusted_devices table
   - Store device info on login

### Phase 2: Risk-Based MFA (Week 3-4)

1. **Risk Assessment**
   - Implement calculate_auth_risk function
   - Add authentication_risk_log table
   - Integrate risk check into sign-in flow

2. **Conditional MFA**
   - Only require MFA for medium+ risk
   - Skip MFA for trusted devices
   - Add "Trust this device" option

### Phase 3: Enhanced MFA (Week 5-6)

1. **TOTP Support**
   - Add TOTP secret generation
   - QR code enrollment flow
   - TOTP verification logic

2. **WebAuthn Support** (Optional)
   - Implement WebAuthn registration
   - Add credential storage
   - WebAuthn authentication flow

### Phase 4: Optimization (Week 7-8)

1. **Performance**
   - Cache risk assessments
   - Optimize database queries
   - Add database indexes

2. **User Experience**
   - Remember device UI
   - MFA method selection
   - Recovery flow improvements

---

## Part 5: Comparison Table

| Feature | Current | Proposed | Benefit |
|---------|---------|----------|---------|
| **MFA Methods** | SMS only | SMS, TOTP, WebAuthn | More secure, lower cost |
| **Code Storage** | Plain text | Encrypted | Prevent code leaks |
| **MFA Frequency** | Every 24 hours | Risk-based | Better UX, same security |
| **Device Trust** | None | Trusted device list | Skip MFA on known devices |
| **Risk Assessment** | None | Multi-factor scoring | Adaptive security |
| **Session Management** | Fixed 24hr | Device-based duration | Flexible security |
| **Audit Logging** | Minimal | Comprehensive | Investigation & compliance |
| **Rate Limiting** | Basic | Sophisticated | Prevent abuse |
| **Recovery Options** | SMS only | Multiple backup methods | Better disaster recovery |
| **User Control** | None | Choose MFA method, trust devices | Better experience |
| **Admin Visibility** | Limited | Full audit trail | Security monitoring |
| **Cost** | High (SMS) | Lower (TOTP preferred) | Reduced operating costs |
| **Compliance** | Basic | NIST 800-63B aligned | Regulatory compliance |

---

## Part 6: Recommendations Summary

### Immediate Actions (Do Now)

1. ✅ **Add Security Logging** - Critical for investigating incidents like the one you experienced
2. ✅ **Implement Device Fingerprinting** - Foundation for trust model
3. ✅ **Add Risk-Based MFA** - Improve UX without sacrificing security

### Short-Term (Next Sprint)

4. ✅ **Add TOTP Support** - Reduce SMS costs, increase security
5. ✅ **Implement "Trust This Device"** - Major UX improvement
6. ✅ **Encrypt Sensitive Data** - MFA codes, phone numbers

### Medium-Term (Next Quarter)

7. ✅ **Add WebAuthn** - Best security, best UX (Touch ID, YubiKey)
8. ✅ **Geo-Velocity Checks** - Detect impossible travel
9. ✅ **Admin Dashboard** - Security monitoring UI

### Long-Term (Future)

10. ✅ **Behavioral Biometrics** - Typing patterns, mouse movements
11. ✅ **AI/ML Risk Scoring** - Advanced anomaly detection
12. ✅ **Zero Trust Architecture** - Continuous verification

---

## Part 7: Cost-Benefit Analysis

### Current Annual Costs (Estimated)

- **SMS**: 1000 users × 2 MFA/day × 365 days × $0.0083 = **$6,059/year**
- **Development Time**: Investigating issues like this = **$2,000/year**
- **User Churn**: Frustrated users due to excessive MFA = **Hard to quantify**

### Proposed Annual Costs

- **SMS** (50% reduction via TOTP): **$3,030/year**
- **TOTP** (free): **$0/year**
- **WebAuthn** (free): **$0/year**
- **Initial Development**: **$15,000** (one-time)
- **Ongoing Maintenance**: **$2,000/year**

### ROI

- **Year 1**: -$12,970 (investment year)
- **Year 2+**: +$3,029/year savings
- **Breakeven**: ~4 years
- **Intangible Benefits**: Better security, happier users, compliance

---

**Created**: 2026-01-04
**Version**: 1.0
**Status**: Proposal - Pending Review
**Next Steps**: Review with team, prioritize phases, estimate resources
