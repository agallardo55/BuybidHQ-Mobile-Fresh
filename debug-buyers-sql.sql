-- =====================================================
-- BUYERS ACCESS DEBUGGING - Run in Supabase SQL Editor
-- =====================================================
-- This script will help identify why you can't access buyers

-- STEP 1: Check your current user data
-- Replace 'YOUR_EMAIL_HERE' with your actual email address
-- =====================================================

-- Check if you exist in buybidhq_users table
SELECT 
  'USER DATA CHECK' as check_type,
  id,
  email,
  role,
  app_role,
  account_id,
  dealership_id,
  created_at,
  updated_at
FROM buybidhq_users 
WHERE email = 'YOUR_EMAIL_HERE';

-- Check your account information
SELECT 
  'ACCOUNT DATA CHECK' as check_type,
  a.id as account_id,
  a.name as account_name,
  a.plan,
  a.seat_limit,
  a.billing_status,
  a.created_at
FROM accounts a
JOIN buybidhq_users u ON a.id = u.account_id
WHERE u.email = 'YOUR_EMAIL_HERE';

-- Check if you have any buyers you own
SELECT 
  'OWNED BUYERS CHECK' as check_type,
  COUNT(*) as owned_buyers_count,
  STRING_AGG(buyer_name, ', ') as buyer_names
FROM buyers b
JOIN buybidhq_users u ON b.owner_user_id = u.id
WHERE u.email = 'YOUR_EMAIL_HERE'
  AND b.deleted_at IS NULL;

-- Check all buyers in your account (if you have one)
SELECT 
  'ACCOUNT BUYERS CHECK' as check_type,
  COUNT(*) as total_buyers_in_account,
  STRING_AGG(buyer_name, ', ') as buyer_names
FROM buyers b
JOIN buybidhq_users u ON b.account_id = u.account_id
WHERE u.email = 'YOUR_EMAIL_HERE'
  AND b.deleted_at IS NULL;

-- Test RLS policy functions
SELECT 
  'RLS FUNCTION TESTS' as check_type,
  current_user_role() as current_role,
  auth.uid() as current_user_id;

-- Check what buyers you can actually see (this will show RLS in action)
SELECT 
  'VISIBLE BUYERS TEST' as check_type,
  id,
  buyer_name,
  owner_user_id,
  account_id,
  created_at
FROM buyers
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;
