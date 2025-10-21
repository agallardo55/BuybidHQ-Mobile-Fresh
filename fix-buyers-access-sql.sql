-- =====================================================
-- FIX BUYERS ACCESS ISSUE - Run in Supabase SQL Editor
-- =====================================================
-- This script will fix the most common buyers access issues

-- STEP 1: Fix RLS policies for basic/member users
-- =====================================================

-- Add policy for basic/member users to view buyers in their account
CREATE POLICY "Basic users can view account buyers" ON public.buyers
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'member'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
);

-- Add policy for basic/member users to create buyers in their account
CREATE POLICY "Basic users can create buyers" ON public.buyers
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'member'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
  AND owner_user_id = auth.uid()
);

-- Add policy for basic/member users to update buyers they own
CREATE POLICY "Basic users can update own buyers" ON public.buyers
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'member'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
  AND owner_user_id = auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'member'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
  AND owner_user_id = auth.uid()
);

-- Add policy for basic/member users to delete buyers they own
CREATE POLICY "Basic users can delete own buyers" ON public.buyers
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'member'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
  AND owner_user_id = auth.uid()
);

-- STEP 2: Fix user account setup issues
-- =====================================================

-- Fix users without account_id (create account and assign)
DO $$
DECLARE
    new_account_id UUID;
    user_record RECORD;
BEGIN
    -- Find users without account_id
    FOR user_record IN 
        SELECT id, email FROM buybidhq_users WHERE account_id IS NULL
    LOOP
        -- Create a new account for this user
        INSERT INTO accounts (name, plan, seat_limit, billing_status)
        VALUES ('Auto Account for ' || user_record.email, 'free', 1, 'active')
        RETURNING id INTO new_account_id;
        
        -- Assign the user to this account
        UPDATE buybidhq_users 
        SET account_id = new_account_id
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Created account % for user %', new_account_id, user_record.email;
    END LOOP;
END $$;

-- Fix app_role for basic users
UPDATE buybidhq_users 
SET app_role = 'member'
WHERE role = 'basic' AND app_role != 'member';

-- STEP 3: Verify the fixes
-- =====================================================

-- Check that all users now have account_id
SELECT 
  'VERIFICATION: Users without account_id' as check_type,
  COUNT(*) as count
FROM buybidhq_users 
WHERE account_id IS NULL;

-- Check that all basic users have correct app_role
SELECT 
  'VERIFICATION: Basic users with wrong app_role' as check_type,
  COUNT(*) as count
FROM buybidhq_users 
WHERE role = 'basic' AND app_role != 'member';

-- Show current RLS policies on buyers table
SELECT 
  'VERIFICATION: Current RLS policies' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'buyers'
ORDER BY policyname;
