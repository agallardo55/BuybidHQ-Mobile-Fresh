-- ================================================================
-- FIX: Infinite Recursion in buybidhq_users RLS Policies
-- ================================================================
-- Problem: RLS policies on buybidhq_users were querying buybidhq_users
-- within their own definitions, causing infinite recursion.
-- 
-- Solution: Use SECURITY DEFINER functions that query the 
-- account_administrators table instead of buybidhq_users.
-- 
-- IMPORTANT PATTERN: Never query the same table within its own RLS policy.
-- Always use SECURITY DEFINER functions that query OTHER tables.
-- ================================================================

-- Step 1: Create security definer function to safely get user's account_id
-- This bypasses RLS and directly queries buybidhq_users
CREATE OR REPLACE FUNCTION public.get_user_account_id_safe(p_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_id 
  FROM buybidhq_users 
  WHERE id = p_user_id
  AND deleted_at IS NULL;
$$;

COMMENT ON FUNCTION public.get_user_account_id_safe IS 
'Safely retrieves a user''s account_id without triggering RLS. Used to prevent infinite recursion in RLS policies.';

-- Step 2: Create security definer function to check account admin status
-- Uses account_administrators table (NOT buybidhq_users) to avoid recursion
CREATE OR REPLACE FUNCTION public.is_account_admin_safe(p_user_id uuid, p_target_account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM account_administrators aa
    WHERE aa.user_id = p_user_id
    AND aa.account_id = p_target_account_id
    AND aa.status = 'active'
  );
$$;

COMMENT ON FUNCTION public.is_account_admin_safe IS 
'Safely checks if a user is an account admin using the account_administrators table. Prevents RLS recursion by NOT querying buybidhq_users.';

-- Step 3: Create combined function for viewing account users
-- Combines super admin check with safe account admin check
CREATE OR REPLACE FUNCTION public.can_view_account_users(p_viewer_id uuid, p_target_account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    is_super_admin(p_viewer_id) OR
    is_account_admin_safe(p_viewer_id, p_target_account_id);
$$;

COMMENT ON FUNCTION public.can_view_account_users IS 
'Checks if a user can view users in a specific account. Safe for use in RLS policies - does not cause recursion.';

-- Step 4: Drop the problematic recursive policies
DROP POLICY IF EXISTS "Account admins can view their account users" ON public.buybidhq_users;
DROP POLICY IF EXISTS "Account admins can update their account users" ON public.buybidhq_users;

-- Step 5: Create new safe SELECT policy
-- Uses can_view_account_users function instead of querying buybidhq_users
CREATE POLICY "Account admins can view account users safe"
ON public.buybidhq_users
FOR SELECT
TO authenticated
USING (
  can_view_account_users(auth.uid(), account_id)
);

COMMENT ON POLICY "Account admins can view account users safe" ON public.buybidhq_users IS 
'Allows account admins to view users in their account. Uses SECURITY DEFINER functions to prevent infinite recursion.';

-- Step 6: Create new safe UPDATE policy
-- Uses can_view_account_users function instead of querying buybidhq_users
CREATE POLICY "Account admins can update account users safe"
ON public.buybidhq_users
FOR UPDATE
TO authenticated
USING (
  can_view_account_users(auth.uid(), account_id)
)
WITH CHECK (
  can_view_account_users(auth.uid(), account_id)
);

COMMENT ON POLICY "Account admins can update account users safe" ON public.buybidhq_users IS 
'Allows account admins to update users in their account. Uses SECURITY DEFINER functions to prevent infinite recursion.';