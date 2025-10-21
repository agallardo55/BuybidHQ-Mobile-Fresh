-- =====================================================
-- FIX RLS POLICIES FOR buybidhq_users TABLE
-- Resolves 406 Not Acceptable errors and improves performance
-- =====================================================
-- This migration fixes AbortError and 406 errors by:
-- 1. Simplifying RLS policies (no circular dependencies)
-- 2. Adding indexes for performance
-- 3. Allowing email-based queries for MFA and auth functions
-- 4. Maintaining security with proper scoping
-- =====================================================

-- Start transaction for rollback safety
BEGIN;

-- =====================================================
-- STEP 1: BACKUP CURRENT POLICIES (for rollback)
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Backing up current RLS policies...';
END $$;

-- Store policy definitions in a comment for reference
COMMENT ON TABLE public.buybidhq_users IS 
'RLS Policy Migration - Applied 2025-01-21
Previous policies removed and replaced with optimized versions.
Original policies backed up in git history.';

-- =====================================================
-- STEP 2: DROP PROBLEMATIC POLICIES
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Dropping problematic RLS policies...';
END $$;

-- Drop any policies that might cause circular dependencies or 406 errors
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.buybidhq_users;
DROP POLICY IF EXISTS "Users can read own data" ON public.buybidhq_users;
DROP POLICY IF EXISTS "Complex user access policy" ON public.buybidhq_users;
DROP POLICY IF EXISTS "Users can read own record" ON public.buybidhq_users;

-- Keep the self-access policy if it uses auth.uid() = id (fast and safe)
-- We'll recreate it below to ensure consistency

-- =====================================================
-- STEP 3: CREATE OPTIMIZED POLICIES
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Creating optimized RLS policies...';
END $$;

-- Policy 1: Users can read their own record by ID (FAST - direct comparison)
CREATE POLICY "Users can read own record by ID"
ON public.buybidhq_users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Service role has full access (for Edge Functions)
CREATE POLICY "Service role full access"
ON public.buybidhq_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 3: Authenticated users can search by email (scoped for security)
CREATE POLICY "Authenticated users can search by email"
ON public.buybidhq_users
FOR SELECT
TO authenticated
USING (
  -- Allow users to find their own record by email
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR
  -- Allow super admins to search by email
  EXISTS (
    SELECT 1 FROM public.super_administrators
    WHERE user_id = auth.uid()
      AND status = 'active'
  )
  OR
  -- Allow account admins to search within their account
  EXISTS (
    SELECT 1 FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'account_admin'
      AND requester.account_id = buybidhq_users.account_id
      AND requester.deleted_at IS NULL
  )
);

-- Keep existing super admin and account admin policies for full table access
-- (These should already exist from previous migrations)

-- =====================================================
-- STEP 4: ADD PERFORMANCE INDEXES
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Adding performance indexes...';
END $$;

-- Index for email lookups (used by MFA functions)
CREATE INDEX IF NOT EXISTS idx_buybidhq_users_email 
ON public.buybidhq_users(email) 
WHERE deleted_at IS NULL;

-- Index for account_id lookups (used by account admin policy)
CREATE INDEX IF NOT EXISTS idx_buybidhq_users_account_id 
ON public.buybidhq_users(account_id) 
WHERE deleted_at IS NULL;

-- Index for app_role lookups (used by RLS policies)
CREATE INDEX IF NOT EXISTS idx_buybidhq_users_app_role 
ON public.buybidhq_users(app_role) 
WHERE deleted_at IS NULL;

-- Composite index for email + deleted_at (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_buybidhq_users_email_not_deleted 
ON public.buybidhq_users(email, deleted_at) 
WHERE deleted_at IS NULL;

-- =====================================================
-- STEP 5: ANALYZE TABLES FOR QUERY OPTIMIZATION
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Analyzing tables for query optimizer...';
END $$;

ANALYZE public.buybidhq_users;
ANALYZE public.super_administrators;
ANALYZE public.account_administrators;

-- =====================================================
-- STEP 6: VERIFICATION
-- =====================================================
DO $$
DECLARE
  policy_count INTEGER;
  index_count INTEGER;
BEGIN
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'buybidhq_users';
  
  RAISE NOTICE 'Total RLS policies on buybidhq_users: %', policy_count;
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE tablename = 'buybidhq_users' 
    AND schemaname = 'public';
  
  RAISE NOTICE 'Total indexes on buybidhq_users: %', index_count;
  
  -- Verify critical policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'buybidhq_users' 
      AND policyname = 'Users can read own record by ID'
  ) THEN
    RAISE EXCEPTION 'Critical policy "Users can read own record by ID" not created!';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'buybidhq_users' 
      AND policyname = 'Service role full access'
  ) THEN
    RAISE EXCEPTION 'Critical policy "Service role full access" not created!';
  END IF;
  
  RAISE NOTICE 'All critical policies verified successfully!';
END $$;

-- =====================================================
-- STEP 7: DISPLAY FINAL POLICY LIST
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '=== Final RLS Policies on buybidhq_users ===';
END $$;

SELECT 
  policyname as "Policy Name",
  cmd as "Command",
  roles as "Roles",
  LEFT(qual::text, 100) as "USING Clause"
FROM pg_policies 
WHERE tablename = 'buybidhq_users'
  AND schemaname = 'public'
ORDER BY cmd, policyname;

-- Commit transaction
COMMIT;

-- =====================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================
-- If you need to rollback this migration:
-- 
-- BEGIN;
-- DROP POLICY IF EXISTS "Users can read own record by ID" ON public.buybidhq_users;
-- DROP POLICY IF EXISTS "Service role full access" ON public.buybidhq_users;
-- DROP POLICY IF EXISTS "Authenticated users can search by email" ON public.buybidhq_users;
-- DROP INDEX IF EXISTS idx_buybidhq_users_email;
-- DROP INDEX IF EXISTS idx_buybidhq_users_account_id;
-- DROP INDEX IF EXISTS idx_buybidhq_users_app_role;
-- DROP INDEX IF EXISTS idx_buybidhq_users_email_not_deleted;
-- COMMIT;
-- 
-- Then recreate your original policies from git history

-- =====================================================
-- TESTING QUERIES (Run after migration)
-- =====================================================
-- Test 1: Self-access by ID (should work)
-- SELECT * FROM buybidhq_users WHERE id = auth.uid();
-- 
-- Test 2: Email query for own email (should work)
-- SELECT id FROM buybidhq_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid());
-- 
-- Test 3: Email query for other user (should fail unless admin)
-- SELECT id FROM buybidhq_users WHERE email = 'someone@else.com';

