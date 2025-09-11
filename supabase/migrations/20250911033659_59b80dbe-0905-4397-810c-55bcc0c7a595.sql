-- SECURITY FIX: Ensure contact_submissions table has proper RLS policies and ownership

-- First, let's see what policies currently exist
SELECT 
  'Current Policies on contact_submissions:' as info,
  string_agg(policyname || ' (' || cmd || ')', ', ') as policies
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'contact_submissions';

-- Check for missing admin-only SELECT policy
DO $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'contact_submissions'
      AND cmd = 'SELECT'
      AND policyname = 'Admins can view contact submissions'
  ) INTO policy_exists;
  
  -- If SELECT policy doesn't exist, create it
  IF NOT policy_exists THEN
    EXECUTE 'CREATE POLICY "Admins can view contact submissions" 
             ON public.contact_submissions 
             FOR SELECT 
             USING (is_admin(auth.uid()))';
    RAISE NOTICE 'Created missing admin SELECT policy';
  ELSE
    RAISE NOTICE 'Admin SELECT policy already exists';
  END IF;
END $$;

-- Ensure no dangerous permissions exist
REVOKE ALL ON public.contact_submissions FROM public;
REVOKE ALL ON public.contact_submissions FROM anon;
REVOKE ALL ON public.contact_submissions FROM authenticated;

-- Grant only necessary permissions that work through RLS
GRANT SELECT, INSERT ON public.contact_submissions TO authenticated;

-- Verify RLS is enabled (should already be enabled)
SELECT 
  'RLS Status Verification' as check_type,
  CASE WHEN rowsecurity THEN 'RLS ENABLED ✓' ELSE 'RLS DISABLED ❌' END as status
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'contact_submissions';

-- Final verification of all policies
SELECT 
  'Final Policy Check' as verification,
  policyname as policy_name,
  cmd as command,
  COALESCE(qual, 'none') as using_condition,
  COALESCE(with_check::text, 'none') as with_check_condition
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'contact_submissions'
ORDER BY cmd, policyname;