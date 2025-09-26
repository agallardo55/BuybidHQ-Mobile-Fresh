-- Continue fixing remaining functions with search path warnings
CREATE OR REPLACE FUNCTION public.is_super_admin(checking_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM super_administrators 
    WHERE user_id = checking_user_id AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_account_admin(checking_user_id uuid, target_account_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM account_administrators 
    WHERE user_id = checking_user_id 
    AND (target_account_id IS NULL OR account_id = target_account_id)
    AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_effective_role(checking_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check super admin first (global BuyBidHQ admin)
  IF is_super_admin(checking_user_id) THEN
    RETURN 'super_admin';
  END IF;
  
  -- Check account admin (dealership-level admin)
  IF is_account_admin(checking_user_id) THEN
    RETURN 'account_admin';
  END IF;
  
  -- Return regular app role
  RETURN (SELECT app_role FROM buybidhq_users WHERE id = checking_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_dealership_admin(checking_user_id uuid, target_dealership_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM account_administrators aa
    JOIN buybidhq_users u ON aa.user_id = u.id
    WHERE aa.user_id = checking_user_id 
    AND u.dealership_id = target_dealership_id
    AND aa.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_dealership(checking_user_id uuid, target_dealership_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    is_super_admin(checking_user_id) OR 
    is_dealership_admin(checking_user_id, target_dealership_id);
$$;

CREATE OR REPLACE FUNCTION public.can_access_dealership(checking_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM buybidhq_users 
    WHERE id = checking_user_id
    AND deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.check_admin_status(checking_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_role_cache 
    WHERE user_id = checking_user_id 
    AND is_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_admin_access(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM dealership_access_cache
        WHERE user_id = $1 
        AND access_level = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.has_dealership_access(user_id uuid, target_dealership_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM dealership_access_cache
        WHERE user_id = $1 
        AND (
            access_level = 'admin' 
            OR (
                access_level = 'dealer' 
                AND dealership_id = target_dealership_id
            )
        )
    );
$$;

CREATE OR REPLACE FUNCTION public.can_access_buyer(checking_user_id uuid, target_buyer_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM buyers_access_cache
        WHERE user_id = checking_user_id 
        AND buyer_id = target_buyer_id
    )
    OR EXISTS (
        SELECT 1 
        FROM user_role_cache 
        WHERE user_id = checking_user_id 
        AND is_admin = true
    );
$$;

CREATE OR REPLACE FUNCTION public.check_user_role(user_id uuid, required_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM buybidhq_users 
    WHERE id = user_id 
    AND role::text = required_role
  );
$$;

CREATE OR REPLACE FUNCTION public.check_user_role_no_rls(user_id uuid, required_role user_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM buybidhq_users 
    WHERE id = user_id 
    AND role = required_role
    AND deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(checking_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    -- Check new super_administrators table first, then fall back to legacy cache
    SELECT COALESCE(
        (SELECT true FROM super_administrators WHERE user_id = checking_user_id AND status = 'active'),
        (SELECT is_admin FROM user_role_cache WHERE user_id = checking_user_id),
        false
    );
$$;

CREATE OR REPLACE FUNCTION public.is_basic_or_individual(checking_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM buybidhq_users
    WHERE id = checking_user_id
    AND role IN ('basic', 'individual')
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_dealer(checking_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Dealers are now account admins with basic role
  SELECT EXISTS (
    SELECT 1 FROM buybidhq_users u
    WHERE u.id = checking_user_id
    AND u.role = 'basic'
    AND u.app_role = 'account_admin'
    AND u.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(p_user_id uuid, p_resource_type text, p_resource_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM user_permissions
        WHERE user_id = p_user_id 
        AND resource_type = p_resource_type
        AND resource_id = p_resource_id
    )
    OR EXISTS (
        SELECT 1 
        FROM buybidhq_users 
        WHERE id = p_user_id 
        AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM superadmin 
    WHERE email = user_email 
    AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.maintain_bid_request_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Insert access for the request owner
    INSERT INTO bid_request_access (user_id, bid_request_id, access_level)
    VALUES (NEW.user_id, NEW.id, 'owner')
    ON CONFLICT (user_id, bid_request_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE notifications
  SET cleared_at = NOW()
  WHERE user_id = auth.uid()
    AND cleared_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_primary_dealer(checking_user_id uuid, dealership_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM dealerships d
    WHERE d.id = dealership_id 
    AND d.primary_user_id = checking_user_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS character varying
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.create_mfa_verification(p_user_id uuid, p_method mfa_method)
RETURNS TABLE(verification_id uuid, code character varying, expires_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_code VARCHAR(6);
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_verification_id UUID;
BEGIN
    -- Generate verification code
    v_code := generate_verification_code();
    -- Set expiration (5 minutes from now)
    v_expires_at := now() + interval '5 minutes';
    
    -- Create verification record
    INSERT INTO mfa_verifications (
        user_id,
        verification_code,
        method,
        expires_at
    )
    VALUES (
        p_user_id,
        v_code,
        p_method,
        v_expires_at
    )
    RETURNING id INTO v_verification_id;
    
    RETURN QUERY
    SELECT v_verification_id, v_code, v_expires_at;
END;
$$;