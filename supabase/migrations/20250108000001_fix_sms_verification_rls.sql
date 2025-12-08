-- ============================================================================
-- Fix RLS Policy for SMS Verification Codes
-- ============================================================================
-- Purpose: Allow service role to insert/update/delete verification codes
-- ============================================================================

BEGIN;

-- Drop existing service role policy
DROP POLICY IF EXISTS "Service role can manage all codes" ON public.sms_verification_codes;

-- Create new policy that explicitly grants service role full access
CREATE POLICY "Service role can manage all codes"
  ON public.sms_verification_codes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMIT;
