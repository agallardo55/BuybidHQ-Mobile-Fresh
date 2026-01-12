-- Create MFA Bypass Tokens Table
-- Purpose: Database-backed MFA bypass for payment flows and admin grants
-- Replaces insecure URL parameter and sessionStorage bypass

CREATE TABLE public.mfa_bypass_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('payment_success', 'admin_grant')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '10 minutes',
  used_at timestamptz,
  used_from_ip inet,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, reason)
);

-- Indexes for performance
CREATE INDEX idx_mfa_bypass_tokens_user_id ON public.mfa_bypass_tokens(user_id);
CREATE INDEX idx_mfa_bypass_tokens_active ON public.mfa_bypass_tokens(user_id, expires_at) WHERE used_at IS NULL;

-- Enable Row Level Security
ALTER TABLE public.mfa_bypass_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bypass tokens
CREATE POLICY "Users can view own bypass tokens" ON public.mfa_bypass_tokens
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Policy: Only service role can create/update bypass tokens (via Edge Functions)
CREATE POLICY "Service role can manage bypass tokens" ON public.mfa_bypass_tokens
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.mfa_bypass_tokens IS 'Database-backed MFA bypass tokens for secure payment flows and admin grants. Tokens expire after 10 minutes and can only be used once.';
