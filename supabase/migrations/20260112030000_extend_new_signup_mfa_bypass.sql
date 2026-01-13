-- Extend MFA bypass for new signups from 10 minutes to 24 hours
-- Users who signed up today shouldn't need MFA on their first day

CREATE OR REPLACE FUNCTION public.needs_daily_mfa()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_verified timestamptz;
  v_hours_elapsed numeric;
  v_user_phone text;
  v_account_age_hours numeric;
BEGIN
  -- Get user's phone number from auth.users first
  SELECT phone INTO v_user_phone
  FROM auth.users
  WHERE id = auth.uid();

  -- If no phone in auth.users, check buybidhq_users.mobile_number
  IF v_user_phone IS NULL THEN
    SELECT mobile_number INTO v_user_phone
    FROM public.buybidhq_users
    WHERE id = auth.uid();
  END IF;

  -- If user has no phone anywhere, they don't need MFA
  IF v_user_phone IS NULL THEN
    RETURN false;
  END IF;

  -- Check how long ago the account was created (in hours)
  SELECT EXTRACT(EPOCH FROM (now() - created_at)) / 3600 INTO v_account_age_hours
  FROM auth.users
  WHERE id = auth.uid();

  -- If account is less than 24 hours old, skip MFA (first day bypass)
  -- This gives new users a full day to explore without MFA hassle
  IF v_account_age_hours < 24 THEN
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

COMMENT ON FUNCTION public.needs_daily_mfa() IS
  'Returns true if user needs MFA verification (24+ hours since last, or never verified). Skips MFA for accounts created within last 24 hours (first day bypass). Checks both auth.users.phone and buybidhq_users.mobile_number. Returns false if user has no phone number.';
