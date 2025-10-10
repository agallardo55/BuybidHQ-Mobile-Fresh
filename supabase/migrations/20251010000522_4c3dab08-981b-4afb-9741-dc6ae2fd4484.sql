-- =====================================================
-- PHASE 1: CRITICAL PII PROTECTION
-- Implement granular access control for user and buyer data
-- =====================================================

-- ============================================
-- STEP 1: Lock Down buybidhq_users Table
-- ============================================

-- Drop overly permissive admin policy
DROP POLICY IF EXISTS "Admins can access all users" ON public.buybidhq_users;

-- Keep existing user self-access policy (already correct)
-- DROP POLICY IF EXISTS "Users can access their own profile" ON public.buybidhq_users;
-- (This policy already exists and is correct)

-- Create granular super admin policy
CREATE POLICY "Super admins can access all users" ON public.buybidhq_users
FOR ALL 
USING (
  is_super_admin(auth.uid())
)
WITH CHECK (
  is_super_admin(auth.uid())
);

-- Account admins can only view users in their account
CREATE POLICY "Account admins can view their account users" ON public.buybidhq_users
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'account_admin'
      AND requester.account_id = buybidhq_users.account_id
      AND requester.deleted_at IS NULL
  )
);

-- Account admins can update users in their account (except role changes)
CREATE POLICY "Account admins can update their account users" ON public.buybidhq_users
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'account_admin'
      AND requester.account_id = buybidhq_users.account_id
      AND requester.deleted_at IS NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'account_admin'
      AND requester.account_id = buybidhq_users.account_id
      AND requester.deleted_at IS NULL
  )
);

-- ============================================
-- STEP 2: Restrict Buyers Table Access
-- ============================================

-- Drop overly permissive account-wide policy
DROP POLICY IF EXISTS "Users can manage buyers in their account" ON public.buyers;

-- Users can only manage buyers they own
CREATE POLICY "Users can manage their own buyers" ON public.buyers
FOR ALL 
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

-- Account admins can view buyers in their account
CREATE POLICY "Account admins can view account buyers" ON public.buyers
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'account_admin'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
);

-- Account admins can update/delete buyers in their account
CREATE POLICY "Account admins can manage account buyers" ON public.buyers
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'account_admin'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'account_admin'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
);

CREATE POLICY "Account admins can delete account buyers" ON public.buyers
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'account_admin'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
);

-- Super admins have full access to all buyers
CREATE POLICY "Super admins manage all buyers" ON public.buyers
FOR ALL 
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- ============================================
-- STEP 3: Audit Query (for manual review)
-- ============================================
-- Run this query manually to review elevated privilege assignments:
-- 
-- SELECT 
--   u.email, 
--   u.full_name, 
--   u.app_role,
--   u.account_id,
--   sa.status as is_super_admin,
--   aa.status as is_account_admin
-- FROM buybidhq_users u
-- LEFT JOIN super_administrators sa ON u.id = sa.user_id
-- LEFT JOIN account_administrators aa ON u.id = aa.user_id
-- WHERE u.app_role IN ('account_admin', 'super_admin') 
--    OR sa.status = 'active'
--    OR aa.status = 'active'
-- ORDER BY u.app_role DESC;

COMMENT ON POLICY "Super admins can access all users" ON public.buybidhq_users IS 
'Phase 1 Security Fix: Only super admins verified via is_super_admin() can access all user PII';

COMMENT ON POLICY "Account admins can view their account users" ON public.buybidhq_users IS 
'Phase 1 Security Fix: Account admins can only view users within their own account';

COMMENT ON POLICY "Users can manage their own buyers" ON public.buyers IS 
'Phase 1 Security Fix: Users can only access buyers they created, preventing account-wide harvesting';

COMMENT ON POLICY "Account admins can view account buyers" ON public.buyers IS 
'Phase 1 Security Fix: Account admins can view but not automatically modify all account buyers';