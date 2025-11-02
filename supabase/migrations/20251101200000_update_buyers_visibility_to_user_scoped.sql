-- Update buyers RLS policies to user-scoped visibility
-- Super Admins and Admins have global read/write/delete permissions
-- All other users can only see/manage their own buyers (owner_user_id = auth.uid())

-- Drop all existing buyer policies
DROP POLICY IF EXISTS "Users can manage buyers in their account" ON public.buyers;
DROP POLICY IF EXISTS "Users can manage their own buyers" ON public.buyers;
DROP POLICY IF EXISTS "Account admins can view account buyers" ON public.buyers;
DROP POLICY IF EXISTS "Account admins can manage account buyers" ON public.buyers;
DROP POLICY IF EXISTS "Account admins can delete account buyers" ON public.buyers;
DROP POLICY IF EXISTS "Super admins manage all buyers" ON public.buyers;
DROP POLICY IF EXISTS "Basic users can view account buyers" ON public.buyers;
DROP POLICY IF EXISTS "Basic users can create buyers" ON public.buyers;
DROP POLICY IF EXISTS "Basic users can update own buyers" ON public.buyers;
DROP POLICY IF EXISTS "Basic users can delete own buyers" ON public.buyers;
DROP POLICY IF EXISTS "Buyers read within account" ON public.buyers;
DROP POLICY IF EXISTS "Buyers write within rules" ON public.buyers;

-- SELECT: Super Admins and Admins can read all buyers globally
-- Regular users can only see buyers they own
CREATE POLICY "Admins see all buyers, users see their own" ON public.buyers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true OR app_role = 'super_admin'
  )
  OR buyers.owner_user_id = auth.uid()
);

-- INSERT: Super Admins and Admins can create buyers globally
-- Regular users can only create buyers they own
CREATE POLICY "Admins can create any buyer, users create their own" ON public.buyers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true OR app_role = 'super_admin'
  )
  OR buyers.owner_user_id = auth.uid()
);

-- UPDATE: Super Admins and Admins can update all buyers globally
-- Regular users can only update buyers they own
CREATE POLICY "Admins can update any buyer, users update their own" ON public.buyers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true OR app_role = 'super_admin'
  )
  OR buyers.owner_user_id = auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true OR app_role = 'super_admin'
  )
  OR buyers.owner_user_id = auth.uid()
);

-- DELETE: Super Admins and Admins can delete all buyers globally
-- Regular users can only delete buyers they own
CREATE POLICY "Admins can delete any buyer, users delete their own" ON public.buyers
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true OR app_role = 'super_admin'
  )
  OR buyers.owner_user_id = auth.uid()
);

COMMENT ON POLICY "Admins see all buyers, users see their own" ON public.buyers IS 
'Super Admins and Admins (role = admin OR app_role = account_admin) can view all buyers globally. Regular users can only view buyers where owner_user_id = auth.uid().';

COMMENT ON POLICY "Admins can create any buyer, users create their own" ON public.buyers IS 
'Super Admins and Admins can create buyers globally. Regular users can only create buyers where owner_user_id = auth.uid().';

COMMENT ON POLICY "Admins can update any buyer, users update their own" ON public.buyers IS 
'Super Admins and Admins can update all buyers globally. Regular users can only update buyers where owner_user_id = auth.uid().';

COMMENT ON POLICY "Admins can delete any buyer, users delete their own" ON public.buyers IS 
'Super Admins and Admins can delete all buyers globally. Regular users can only delete buyers where owner_user_id = auth.uid().';

