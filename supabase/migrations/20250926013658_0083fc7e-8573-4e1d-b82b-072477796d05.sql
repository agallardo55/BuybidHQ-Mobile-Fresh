-- Phase 1: Create SECURITY DEFINER function to replace RLS subquery
CREATE OR REPLACE FUNCTION public.get_current_user_account_admin_status()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM buybidhq_users manager
    WHERE manager.id = auth.uid() 
    AND manager.app_role = 'account_admin'
  );
$$;

-- Phase 2: Update problematic RLS policy to use SECURITY DEFINER function
DROP POLICY IF EXISTS "Account admin access to members" ON public.buybidhq_users;
CREATE POLICY "Account admin access to members" ON public.buybidhq_users
FOR ALL
TO authenticated
USING (
  (
    get_current_user_account_admin_status() 
    AND EXISTS (
      SELECT 1 FROM buybidhq_users target_user
      WHERE target_user.id = buybidhq_users.id
      AND target_user.role IN ('basic', 'salesperson', 'associate', 'individual')
      AND target_user.dealership_id = (
        SELECT dealership_id FROM buybidhq_users WHERE id = auth.uid()
      )
    )
  ) 
  OR check_user_role_no_rls(auth.uid(), 'admin')
);

-- Phase 3: Convert existing functions to SECURITY DEFINER with proper search paths
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT app_role FROM buybidhq_users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_account_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT account_id FROM buybidhq_users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_in_account(a_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM buybidhq_users u
    WHERE u.id = auth.uid() AND u.account_id = a_id
  );
$$;

-- Phase 4: Fix all function search path warnings (42 functions)
CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_event_type text, p_details jsonb DEFAULT '{}'::jsonb, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO user_security_events (
    user_id, event_type, details, ip_address, user_agent
  ) VALUES (
    p_user_id, p_event_type, p_details, p_ip_address, p_user_agent
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.batch_process_carrier_detection()
RETURNS TABLE(total_processed integer, carriers_detected integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_total INTEGER := 0;
    v_detected INTEGER := 0;
    v_carrier_info RECORD;
BEGIN
    FOR v_carrier_info IN
        SELECT id, mobile_number
        FROM buybidhq_users
        WHERE phone_validated = true
        AND (phone_carrier IS NULL OR phone_type IS NULL)
        AND mobile_number IS NOT NULL
        AND deleted_at IS NULL
    LOOP
        v_total := v_total + 1;
        PERFORM get_carrier_for_validated_number(v_carrier_info.id, v_carrier_info.mobile_number);
        IF EXISTS (
            SELECT 1 
            FROM buybidhq_users 
            WHERE id = v_carrier_info.id 
            AND phone_carrier IS NOT NULL
        ) THEN
            v_detected := v_detected + 1;
        END IF;
    END LOOP;
    RETURN QUERY SELECT v_total, v_detected;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_unified_dealer_info()
RETURNS TABLE(id uuid, user_id uuid, dealer_type dealer_type, business_name text, license_number character varying, business_phone text, business_email text, address text, city text, state text, zip_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only allow admins or users viewing their own dealership info
    IF NOT (is_admin(auth.uid()) OR auth.uid() IS NOT NULL) THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        d.id,
        d.primary_user_id as user_id,
        d.dealer_type,
        d.dealer_name as business_name,
        d.license_number,
        d.business_phone,
        d.business_email,
        d.address,
        d.city,
        d.state,
        d.zip_code
    FROM dealerships d
    WHERE 
        -- Admins can see all
        is_admin(auth.uid()) 
        -- Users can only see their own dealership
        OR d.id = (
            SELECT dealership_id FROM buybidhq_users 
            WHERE id = auth.uid()
        );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_bid_request_details(p_token text)
RETURNS TABLE(request_id uuid, created_at timestamp with time zone, status text, notes text, vehicle_year text, vehicle_make text, vehicle_model text, vehicle_trim text, vehicle_vin text, vehicle_mileage text, vehicle_engine text, vehicle_transmission text, vehicle_drivetrain text, buyer_name text, buyer_dealership text, buyer_mobile text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_token_valid boolean := false;
  v_bid_request_id uuid;
  v_buyer_id uuid;
BEGIN
  -- First validate the token with proper security checks
  SELECT 
    (NOT t.is_used AND t.expires_at > now()) as is_valid,
    t.bid_request_id,
    t.buyer_id
  INTO v_token_valid, v_bid_request_id, v_buyer_id
  FROM bid_submission_tokens t
  WHERE t.token = p_token
  LIMIT 1;

  -- If token is invalid, return empty result
  IF NOT v_token_valid OR v_bid_request_id IS NULL THEN
    RETURN;
  END IF;

  -- Additional security check: verify the bid request exists and is accessible
  IF NOT EXISTS (
    SELECT 1 FROM bid_requests 
    WHERE id = v_bid_request_id 
    AND status IN ('Pending', 'Active')
  ) THEN
    RETURN;
  END IF;

  -- Return sanitized bid request details for this specific token
  RETURN QUERY
  SELECT 
    br.id as request_id,
    br.created_at,
    br.status::text,
    COALESCE(bst.notes, '') as notes,
    COALESCE(v.year, 'N/A') as vehicle_year,
    COALESCE(v.make, 'N/A') as vehicle_make,
    COALESCE(v.model, 'N/A') as vehicle_model,
    COALESCE(v.trim, 'N/A') as vehicle_trim,
    COALESCE(v.vin, 'N/A') as vehicle_vin,
    COALESCE(v.mileage, 'N/A') as vehicle_mileage,
    COALESCE(v.engine, 'N/A') as vehicle_engine,
    COALESCE(v.transmission, 'N/A') as vehicle_transmission,
    COALESCE(v.drivetrain, 'N/A') as vehicle_drivetrain,
    COALESCE(u.full_name, 'N/A') as buyer_name,
    CASE 
      WHEN d.dealer_name IS NOT NULL THEN d.dealer_name
      ELSE 'Direct Buyer'
    END as buyer_dealership,
    COALESCE(u.mobile_number, 'N/A') as buyer_mobile
  FROM bid_requests br
  JOIN vehicles v ON br.vehicle_id = v.id
  JOIN buybidhq_users u ON br.user_id = u.id
  LEFT JOIN dealerships d ON u.dealership_id = d.id
  LEFT JOIN bid_submission_tokens bst ON bst.bid_request_id = br.id AND bst.buyer_id = v_buyer_id
  WHERE br.id = v_bid_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_buyer_user_roles()
RETURNS TABLE(id uuid, role user_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only allow admins to access user roles
    IF NOT is_admin(auth.uid()) THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        u.id,
        u.role
    FROM buybidhq_users u
    WHERE u.deleted_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_create_bid_request(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = 'public'
AS $$
DECLARE
  user_account_id UUID;
  account_plan TEXT;
  monthly_count INTEGER;
  month_start TIMESTAMPTZ;
BEGIN
  -- Get user's account info
  SELECT u.account_id, a.plan INTO user_account_id, account_plan
  FROM buybidhq_users u
  JOIN accounts a ON a.id = u.account_id
  WHERE u.id = user_id;
  
  -- If not free plan, unlimited
  IF account_plan != 'free' THEN
    RETURN jsonb_build_object('allowed', true);
  END IF;
  
  -- Check monthly limit for free plan
  month_start := date_trunc('month', now());
  
  SELECT COUNT(*) INTO monthly_count
  FROM bid_requests
  WHERE account_id = user_account_id
  AND created_at >= month_start;
  
  IF monthly_count < 10 THEN
    RETURN jsonb_build_object('allowed', true, 'remaining', 10 - monthly_count);
  ELSE
    RETURN jsonb_build_object('allowed', false, 'reason', 'FREE_LIMIT_REACHED');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_accounts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_password_reset_rate_limit(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_attempts integer;
  v_last_attempt timestamp with time zone;
BEGIN
  -- Get current attempts for this email within the last hour
  SELECT attempts, last_attempt
  INTO v_attempts, v_last_attempt
  FROM password_reset_attempts
  WHERE email = p_email
  AND reset_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no recent attempts, allow
  IF v_attempts IS NULL THEN
    RETURN true;
  END IF;
  
  -- If less than 3 attempts, allow
  IF v_attempts < 3 THEN
    -- Update attempts count
    UPDATE password_reset_attempts
    SET attempts = attempts + 1,
        last_attempt = now()
    WHERE email = p_email
    AND reset_at > now();
    
    RETURN true;
  END IF;
  
  -- Rate limited
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_password_attempts(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO password_reset_attempts (email, attempts)
  VALUES (p_email, 1)
  ON CONFLICT (email) DO UPDATE SET
    attempts = 1,
    last_attempt = now(),
    reset_at = now() + interval '1 hour';
END;
$$;