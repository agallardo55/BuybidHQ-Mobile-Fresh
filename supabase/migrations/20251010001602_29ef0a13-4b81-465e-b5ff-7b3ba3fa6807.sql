-- =====================================================
-- PHASE 1.5: FIX PUBLIC ACCESS WARNINGS
-- Add explicit authentication checks to all policies
-- =====================================================

-- ============================================
-- STEP 1: Fix buybidhq_users Policies
-- ============================================

-- Ensure all policies explicitly require authentication
-- Drop and recreate with explicit role restrictions

DROP POLICY IF EXISTS "Account admins can update their account users" ON public.buybidhq_users;
DROP POLICY IF EXISTS "Account admins can view their account users" ON public.buybidhq_users;
DROP POLICY IF EXISTS "Super admins can access all users" ON public.buybidhq_users;
DROP POLICY IF EXISTS "Users can access their own profile" ON public.buybidhq_users;

-- Users can only access their own profile (authenticated only)
CREATE POLICY "Users can access their own profile" ON public.buybidhq_users
FOR ALL 
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Super admins can access all users (authenticated only)
CREATE POLICY "Super admins can access all users" ON public.buybidhq_users
FOR ALL 
TO authenticated
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Account admins can view users in their account (authenticated only)
CREATE POLICY "Account admins can view their account users" ON public.buybidhq_users
FOR SELECT 
TO authenticated
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

-- Account admins can update users in their account (authenticated only)
CREATE POLICY "Account admins can update their account users" ON public.buybidhq_users
FOR UPDATE 
TO authenticated
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
-- STEP 2: Fix contact_submissions Policies  
-- ============================================

-- Ensure contact submissions can only be read by super admins
DROP POLICY IF EXISTS "Super admin read access to contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Service role can insert contact submissions" ON public.contact_submissions;

-- Only super admins can read contact submissions
CREATE POLICY "Super admins can read contact submissions" ON public.contact_submissions
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- Service role can insert (for edge functions)
CREATE POLICY "Service role can insert contact submissions" ON public.contact_submissions
FOR INSERT 
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'role') = 'service_role'
);

-- ============================================
-- STEP 3: Add Comments for Audit Trail
-- ============================================

COMMENT ON POLICY "Users can access their own profile" ON public.buybidhq_users IS 
'Phase 1.5 Security Fix: Explicit authenticated role restriction to prevent public access warnings';

COMMENT ON POLICY "Super admins can access all users" ON public.buybidhq_users IS 
'Phase 1.5 Security Fix: Explicit authenticated role restriction for super admins';

COMMENT ON POLICY "Super admins can read contact submissions" ON public.contact_submissions IS 
'Phase 1.5 Security Fix: Explicit authenticated role restriction for contact form submissions';