-- Step 1: Populate Super Administrators Table (only for users that exist in auth.users)
INSERT INTO super_administrators (
  user_id,
  email,
  full_name,
  mobile_number,
  status,
  permissions,
  granted_by,
  granted_at
)
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.mobile_number,
  'active',
  '["platform_admin", "manage_all_accounts", "manage_all_users", "manage_all_dealerships", "system_configuration"]'::jsonb,
  u.id, -- Self-granted for migration
  u.created_at
FROM buybidhq_users u
INNER JOIN auth.users au ON u.id = au.id  -- Only include users that exist in auth.users
WHERE u.role = 'admin' AND u.app_role = 'super_admin'
ON CONFLICT (user_id) DO NOTHING;

-- Step 2: Populate Account Administrators Table (only for users that exist in auth.users)
INSERT INTO account_administrators (
  user_id,
  account_id,
  email,
  full_name,
  mobile_number,
  status,
  permissions,
  granted_by,
  granted_at
)
SELECT 
  u.id,
  u.account_id,
  u.email,
  u.full_name,
  u.mobile_number,
  'active',
  '["manage_account_users", "manage_account_buyers", "manage_account_bid_requests", "manage_account_settings"]'::jsonb,
  (SELECT u2.id FROM buybidhq_users u2 INNER JOIN auth.users au2 ON u2.id = au2.id WHERE u2.role = 'admin' AND u2.app_role = 'super_admin' LIMIT 1), -- Granted by super admin
  u.created_at
FROM buybidhq_users u
INNER JOIN auth.users au ON u.id = au.id  -- Only include users that exist in auth.users
WHERE u.app_role = 'account_admin'
ON CONFLICT (user_id, account_id) DO NOTHING;

-- Step 3: Update is_admin function to check both legacy and new systems
CREATE OR REPLACE FUNCTION public.is_admin(checking_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    -- Check new super_administrators table first, then fall back to legacy cache
    SELECT COALESCE(
        (SELECT true FROM super_administrators WHERE user_id = checking_user_id AND status = 'active'),
        (SELECT is_admin FROM user_role_cache WHERE user_id = checking_user_id),
        false
    );
$function$;

-- Step 4: Ensure is_super_admin function works with populated table
CREATE OR REPLACE FUNCTION public.is_super_admin(checking_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM super_administrators 
    WHERE user_id = checking_user_id AND status = 'active'
  );
$function$;

-- Step 5: Ensure is_account_admin function works with populated table
CREATE OR REPLACE FUNCTION public.is_account_admin(checking_user_id uuid, target_account_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM account_administrators 
    WHERE user_id = checking_user_id 
    AND (target_account_id IS NULL OR account_id = target_account_id)
    AND status = 'active'
  );
$function$;

-- Step 6: Update get_user_effective_role to properly distinguish admin types
CREATE OR REPLACE FUNCTION public.get_user_effective_role(checking_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;