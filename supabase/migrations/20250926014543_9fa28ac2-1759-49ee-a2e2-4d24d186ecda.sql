-- Step 1: Drop ALL existing RLS policies to eliminate recursion
-- buybidhq_users policies
DROP POLICY IF EXISTS "Account admin access to members" ON public.buybidhq_users;
DROP POLICY IF EXISTS "Admin access to all users" ON public.buybidhq_users;
DROP POLICY IF EXISTS "Users can access their own record" ON public.buybidhq_users;

-- Other table policies that might cause issues
DROP POLICY IF EXISTS "Users can view their own account" ON public.accounts;
DROP POLICY IF EXISTS "Account admins can update their account" ON public.accounts;

DROP POLICY IF EXISTS "Account users can read bid requests" ON public.bid_requests;
DROP POLICY IF EXISTS "Account users can create bid requests" ON public.bid_requests;
DROP POLICY IF EXISTS "Account users can update bid requests" ON public.bid_requests;

DROP POLICY IF EXISTS "Buyers read within account" ON public.buyers;
DROP POLICY IF EXISTS "Buyers write within rules" ON public.buyers;

-- Step 2: Create simple, non-recursive policies using SECURITY DEFINER functions
-- First ensure we have a reliable current user function
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_data()
RETURNS TABLE(user_id uuid, user_role user_role, app_role text, account_id uuid, dealership_id uuid, is_admin boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    u.id,
    u.role,
    u.app_role,
    u.account_id,
    u.dealership_id,
    (u.role = 'admin' OR EXISTS (SELECT 1 FROM super_administrators WHERE user_id = u.id AND status = 'active')) as is_admin
  FROM buybidhq_users u
  WHERE u.id = auth.uid()
  AND u.deleted_at IS NULL
  LIMIT 1;
$$;

-- Step 3: Create simple, safe RLS policies
-- buybidhq_users - Most critical table
CREATE POLICY "Users can access their own profile" ON public.buybidhq_users
FOR ALL
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can access all users" ON public.buybidhq_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- accounts table
CREATE POLICY "Users can view their own account" ON public.accounts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE account_id = accounts.id
  )
);

CREATE POLICY "Account admins can update their account" ON public.accounts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE account_id = accounts.id 
    AND (app_role = 'account_admin' OR is_admin = true)
  )
);

-- bid_requests table
CREATE POLICY "Users can manage their account bid requests" ON public.bid_requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE account_id = bid_requests.account_id OR is_admin = true
  )
);

-- buyers table  
CREATE POLICY "Users can manage buyers in their account" ON public.buyers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE account_id = buyers.account_id OR is_admin = true
  )
);