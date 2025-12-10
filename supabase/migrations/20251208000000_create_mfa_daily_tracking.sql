-- ============================================================================
-- MFA Daily Verification Tracking
-- ============================================================================
-- Purpose: Track when users last verified MFA for "once per day" enforcement
-- ============================================================================

BEGIN;

-- Create table to track MFA verifications
CREATE TABLE IF NOT EXISTS public.mfa_daily_verification (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  verification_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mfa_daily_verification ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own verification status"
  ON public.mfa_daily_verification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification status"
  ON public.mfa_daily_verification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification status"
  ON public.mfa_daily_verification FOR UPDATE
  USING (auth.uid() = user_id);

-- Function: Check if user needs daily MFA verification
CREATE OR REPLACE FUNCTION public.needs_daily_mfa()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_verified timestamptz;
  v_hours_elapsed numeric;
  v_user_phone text;
BEGIN
  -- Get user's phone number
  SELECT phone INTO v_user_phone
  FROM auth.users
  WHERE id = auth.uid();
  
  -- If user has no phone, they don't need MFA
  IF v_user_phone IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get last verification time
  SELECT last_verified_at INTO v_last_verified
  FROM public.mfa_daily_verification
  WHERE user_id = auth.uid();
  
  -- If never verified, they need MFA
  IF v_last_verified IS NULL THEN
    RETURN true;
  END IF;
  
  -- Calculate hours since last verification
  v_hours_elapsed := EXTRACT(EPOCH FROM (now() - v_last_verified)) / 3600;
  
  -- Return true if 24+ hours have passed
  RETURN v_hours_elapsed >= 24;
END;
$$;

-- Function: Record successful MFA verification
CREATE OR REPLACE FUNCTION public.record_mfa_verification()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.mfa_daily_verification (
    user_id,
    last_verified_at,
    verification_count
  )
  VALUES (
    auth.uid(),
    now(),
    1
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    last_verified_at = now(),
    verification_count = mfa_daily_verification.verification_count + 1,
    updated_at = now();
END;
$$;

-- Add indexes
CREATE INDEX idx_mfa_daily_verification_user_id 
  ON public.mfa_daily_verification(user_id);
CREATE INDEX idx_mfa_daily_verification_last_verified 
  ON public.mfa_daily_verification(last_verified_at);

-- Add comments
COMMENT ON TABLE public.mfa_daily_verification IS 
  'Tracks when users last completed SMS MFA verification for daily requirement';
COMMENT ON FUNCTION public.needs_daily_mfa() IS 
  'Returns true if user needs MFA verification (24+ hours since last, or never verified). Returns false if user has no phone number.';
COMMENT ON FUNCTION public.record_mfa_verification() IS 
  'Records successful MFA verification timestamp. Call this after user successfully verifies SMS code.';

COMMIT;
