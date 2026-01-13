-- Update MFA logic to reset at midnight (calendar day) instead of rolling 24 hours
-- This aligns with the session expiration at midnight

CREATE OR REPLACE FUNCTION public.needs_daily_mfa()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_verified timestamptz;
  v_user_phone text;
  v_account_age_hours numeric;
  v_last_verified_date date;
  v_today_date date;
  v_user_timezone text;
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

  -- Get user's timezone from session table
  SELECT timezone_name INTO v_user_timezone
  FROM public.user_sessions
  WHERE user_id = auth.uid();

  -- If no timezone info, default to UTC
  IF v_user_timezone IS NULL THEN
    v_user_timezone := 'UTC';
  END IF;

  -- Convert last verified time to user's timezone and get date
  v_last_verified_date := (v_last_verified AT TIME ZONE v_user_timezone)::date;
  
  -- Get today's date in user's timezone
  v_today_date := (now() AT TIME ZONE v_user_timezone)::date;

  -- Return true if last verification was on a different day
  -- This resets MFA at midnight in user's timezone
  RETURN v_last_verified_date < v_today_date;
END;
$$;

COMMENT ON FUNCTION public.needs_daily_mfa() IS
  'Returns true if user needs MFA verification (last verification was on a different calendar day in user timezone). Skips MFA for accounts created within last 24 hours. Uses user timezone from user_sessions table for calendar day calculation.';
