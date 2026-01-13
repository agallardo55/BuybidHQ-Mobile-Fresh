-- Fix needs_daily_mfa to handle empty strings, not just NULL
-- Problem: Users with empty string '' in mobile_number were redirected to MFA
-- even though they had no actual phone number

CREATE OR REPLACE FUNCTION public.needs_daily_mfa()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_last_verified timestamptz;
  v_user_phone text;
  v_account_age_hours numeric;
  v_last_verified_date date;
  v_today_date date;
  v_user_timezone text;
BEGIN
  SELECT phone INTO v_user_phone FROM auth.users WHERE id = auth.uid();
  IF v_user_phone IS NULL OR v_user_phone = '' THEN
    SELECT mobile_number INTO v_user_phone FROM public.buybidhq_users WHERE id = auth.uid();
  END IF;
  
  -- Handle NULL, empty string, or whitespace-only strings
  IF v_user_phone IS NULL OR TRIM(COALESCE(v_user_phone, '')) = '' THEN
    RETURN false;
  END IF;
  
  SELECT EXTRACT(EPOCH FROM (now() - created_at)) / 3600 INTO v_account_age_hours
  FROM auth.users WHERE id = auth.uid();
  IF v_account_age_hours < 24 THEN RETURN false; END IF;
  
  SELECT last_verified_at INTO v_last_verified
  FROM public.mfa_daily_verification WHERE user_id = auth.uid();
  IF v_last_verified IS NULL THEN RETURN true; END IF;
  
  SELECT timezone_name INTO v_user_timezone
  FROM public.user_sessions WHERE user_id = auth.uid();
  IF v_user_timezone IS NULL THEN v_user_timezone := 'UTC'; END IF;
  
  v_last_verified_date := (v_last_verified AT TIME ZONE v_user_timezone)::date;
  v_today_date := (now() AT TIME ZONE v_user_timezone)::date;
  
  RETURN v_last_verified_date < v_today_date;
END;
$$;

COMMENT ON FUNCTION public.needs_daily_mfa() IS
  'Returns true if user needs MFA verification. Fixed to handle empty strings in phone fields, not just NULL. Skips MFA for: no phone, account < 24 hours old, or already verified today.';
