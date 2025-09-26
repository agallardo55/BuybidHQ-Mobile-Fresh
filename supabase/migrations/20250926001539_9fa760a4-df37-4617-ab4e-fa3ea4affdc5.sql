-- Consolidate dealer role with account admin (simple approach)
-- Step 1: Migrate existing dealer users to basic role (they already have account_admin app_role)
UPDATE buybidhq_users 
SET role = 'basic'::user_role 
WHERE role = 'dealer'::user_role;

-- Step 2: Update functions to handle consolidated dealer role
CREATE OR REPLACE FUNCTION public.is_dealer(checking_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $function$
  -- Dealers are now account admins with basic role
  SELECT EXISTS (
    SELECT 1 FROM buybidhq_users u
    WHERE u.id = checking_user_id
    AND u.role = 'basic'
    AND u.app_role = 'account_admin'
    AND u.is_active = true
  );
$function$;

-- Step 3: Update RLS policy to use account_admin app_role instead of dealer role  
DROP POLICY IF EXISTS "Dealer access to associates" ON buybidhq_users;

CREATE POLICY "Account admin access to members" 
ON buybidhq_users 
FOR ALL
USING (
  -- Account admins can manage members in their dealership
  (
    EXISTS (
      SELECT 1 FROM buybidhq_users manager
      WHERE manager.id = auth.uid() 
      AND manager.app_role = 'account_admin'
      AND manager.dealership_id = buybidhq_users.dealership_id
    )
    AND role IN ('basic', 'salesperson', 'associate', 'individual')
  ) 
  OR 
  -- Keep existing admin access logic
  check_user_role_no_rls(auth.uid(), 'admin'::user_role)
);

-- Step 4: Update can_manage_user function for consolidated roles
CREATE OR REPLACE FUNCTION public.can_manage_user(manager_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Admin can manage all non-deleted users
  IF EXISTS (
    SELECT 1 FROM buybidhq_users
    WHERE id = manager_id 
    AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;

  -- Account admin can manage all users in their dealership
  IF EXISTS (
    SELECT 1 
    FROM buybidhq_users manager
    JOIN buybidhq_users target ON target.dealership_id = manager.dealership_id
    WHERE manager.id = manager_id 
    AND manager.app_role = 'account_admin'
    AND target.id = target_user_id
    AND target.role IN ('basic', 'individual', 'salesperson', 'associate')
    AND target.deleted_at IS NULL
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$function$;