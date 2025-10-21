-- Script to check and fix user account setup issues
-- This will help identify users who don't have proper account setup

-- Check users without account_id
SELECT 
  'USERS WITHOUT ACCOUNT_ID' as issue_type,
  id,
  email,
  role,
  app_role,
  account_id,
  dealership_id,
  created_at
FROM buybidhq_users 
WHERE account_id IS NULL
ORDER BY created_at DESC;

-- Check users with basic role but wrong app_role
SELECT 
  'BASIC USERS WITH WRONG APP_ROLE' as issue_type,
  id,
  email,
  role,
  app_role,
  account_id,
  dealership_id,
  created_at
FROM buybidhq_users 
WHERE role = 'basic' 
  AND app_role != 'member'
ORDER BY created_at DESC;

-- Check for orphaned accounts (accounts with no users)
SELECT 
  'ORPHANED ACCOUNTS' as issue_type,
  a.id,
  a.name,
  a.plan,
  a.seat_limit,
  a.billing_status,
  a.created_at
FROM accounts a
LEFT JOIN buybidhq_users u ON a.id = u.account_id
WHERE u.account_id IS NULL
ORDER BY a.created_at DESC;

-- Check accounts with users but no proper setup
SELECT 
  'ACCOUNTS WITH USERS' as info_type,
  a.id as account_id,
  a.name as account_name,
  a.plan,
  a.seat_limit,
  a.billing_status,
  COUNT(u.id) as user_count,
  STRING_AGG(u.email, ', ') as user_emails
FROM accounts a
LEFT JOIN buybidhq_users u ON a.id = u.account_id
GROUP BY a.id, a.name, a.plan, a.seat_limit, a.billing_status
ORDER BY user_count DESC;

-- FIXES (uncomment and run after identifying issues):

-- Fix 1: Create account for users without account_id
-- INSERT INTO accounts (name, plan, seat_limit, billing_status)
-- VALUES ('Auto-generated Account', 'free', 1, 'active')
-- RETURNING id;

-- Fix 2: Update users to have account_id (replace ACCOUNT_ID with actual ID)
-- UPDATE buybidhq_users 
-- SET account_id = 'ACCOUNT_ID'
-- WHERE account_id IS NULL;

-- Fix 3: Fix app_role for basic users
-- UPDATE buybidhq_users 
-- SET app_role = 'member'
-- WHERE role = 'basic' AND app_role != 'member';
