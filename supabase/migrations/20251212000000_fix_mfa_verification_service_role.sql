-- ============================================================================
-- Fix MFA Verification for Service Role Authentication
-- ============================================================================
-- Problem: record_mfa_verification() uses auth.uid() which returns NULL
--          when called from Edge Functions using service role key
-- Solution: Accept user_id as parameter and use SECURITY DEFINER
-- ============================================================================

BEGIN;

-- Drop existing function
DROP FUNCTION IF EXISTS public.record_mfa_verification();

-- Create updated function that accepts user_id parameter
CREATE OR REPLACE FUNCTION public.record_mfa_verification(p_user_id uuid)
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
    p_user_id,
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

-- Update comment
COMMENT ON FUNCTION public.record_mfa_verification(uuid) IS
  'Records successful MFA verification timestamp for the specified user. Call this after user successfully verifies SMS code.';

COMMIT;
