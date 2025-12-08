-- ============================================================================
-- SMS Verification Codes Table
-- ============================================================================
-- Purpose: Store temporary 6-digit codes for SMS MFA verification
-- Codes expire after 10 minutes
-- ============================================================================

BEGIN;

-- Create table for SMS verification codes
CREATE TABLE IF NOT EXISTS public.sms_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  phone_number text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_verification_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own verification codes"
  ON public.sms_verification_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all codes"
  ON public.sms_verification_codes FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Indexes
CREATE INDEX idx_sms_verification_user_id 
  ON public.sms_verification_codes(user_id);
CREATE INDEX idx_sms_verification_expires_at 
  ON public.sms_verification_codes(expires_at);
CREATE INDEX idx_sms_verification_verified 
  ON public.sms_verification_codes(verified);

-- Function: Clean up expired codes (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.sms_verification_codes
  WHERE expires_at < now();
END;
$$;

-- Comments
COMMENT ON TABLE public.sms_verification_codes IS 
  'Stores temporary 6-digit SMS verification codes. Codes expire after 10 minutes.';
COMMENT ON FUNCTION public.cleanup_expired_verification_codes() IS 
  'Deletes expired verification codes. Should be run periodically via cron.';

COMMIT;
