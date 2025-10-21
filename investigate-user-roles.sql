-- =====================================================
-- COMPREHENSIVE USER ROLE INVESTIGATION SCRIPT
-- =====================================================
-- This script will help identify exactly why a user has admin access

-- STEP 1: Find the user by email (replace with actual email)
-- =====================================================

-- First, let's see if the user exists at all
SELECT 
  'USER EXISTS CHECK' as check_type,
  id, 
  email, 
  role, 
  app_role, 
  account_id,
  dealership_id,
  created_at,
  updated_at
FROM buybidhq_users 
WHERE email = 'USER_EMAIL_HERE';

-- If the above returns no results, try searching by partial email
-- SELECT 
--   'PARTIAL EMAIL SEARCH' as check_type,
--   id, 
--   email, 
--   role, 
--   app_role
-- FROM buybidhq_users 
-- WHERE email LIKE '%PARTIAL_EMAIL%';

-- STEP 2: Check all possible admin sources
-- =====================================================

-- Check superadmin table
SELECT 
  'SUPERADMIN CHECK' as check_type,
  user_id,
  email,
  status,
  created_at
FROM superadmin 
WHERE email = 'USER_EMAIL_HERE';

-- Check user_roles table
SELECT 
  'USER ROLES CHECK' as check_type,
  ur.user_id,
  ur.role,
  ur.is_active,
  ur.created_at,
  ur.updated_at
FROM user_roles ur
JOIN buybidhq_users u ON ur.user_id = u.id
WHERE u.email = 'USER_EMAIL_HERE';

-- Check account_administrators table
SELECT 
  'ACCOUNT ADMIN CHECK' as check_type,
  aa.user_id,
  aa.account_id,
  aa.status,
  aa.created_at,
  aa.updated_at
FROM account_administrators aa
JOIN buybidhq_users u ON aa.user_id = u.id
WHERE u.email = 'USER_EMAIL_HERE';

-- Check if user is in any admin-related tables
SELECT 
  'ALL ADMIN TABLES CHECK' as check_type,
  'superadmin' as table_name,
  user_id,
  email,
  status
FROM superadmin 
WHERE email = 'USER_EMAIL_HERE'

UNION ALL

SELECT 
  'ALL ADMIN TABLES CHECK' as check_type,
  'user_roles' as table_name,
  ur.user_id::text,
  u.email,
  ur.role
FROM user_roles ur
JOIN buybidhq_users u ON ur.user_id = u.id
WHERE u.email = 'USER_EMAIL_HERE'
AND ur.role IN ('super_admin', 'account_admin')

UNION ALL

SELECT 
  'ALL ADMIN TABLES CHECK' as check_type,
  'account_administrators' as table_name,
  aa.user_id::text,
  u.email,
  aa.status
FROM account_administrators aa
JOIN buybidhq_users u ON aa.user_id = u.id
WHERE u.email = 'USER_EMAIL_HERE';

-- STEP 3: Check account and subscription info
-- =====================================================

-- Check account information
SELECT 
  'ACCOUNT INFO CHECK' as check_type,
  a.id,
  a.name,
  a.plan,
  a.seat_limit,
  a.billing_status,
  a.created_at,
  a.updated_at
FROM accounts a
JOIN buybidhq_users u ON a.id = u.account_id
WHERE u.email = 'USER_EMAIL_HERE';

-- STEP 4: Test admin functions
-- =====================================================

-- Test is_superadmin function
SELECT 
  'IS_SUPERADMIN TEST' as check_type,
  is_superadmin('USER_EMAIL_HERE') as is_superadmin_result;

-- Test is_admin function (if user exists)
SELECT 
  'IS_ADMIN TEST' as check_type,
  is_admin((SELECT id FROM buybidhq_users WHERE email = 'USER_EMAIL_HERE')) as is_admin_result;

-- STEP 5: Check for any cached or computed admin status
-- =====================================================

-- Check if there are any computed admin statuses
SELECT 
  'COMPUTED ADMIN STATUS' as check_type,
  u.id,
  u.email,
  u.role,
  u.app_role,
  CASE 
    WHEN u.app_role IN ('super_admin', 'account_admin') THEN 'YES'
    WHEN u.role = 'admin' THEN 'YES'
    WHEN EXISTS(SELECT 1 FROM superadmin WHERE email = u.email) THEN 'YES'
    WHEN EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role IN ('super_admin', 'account_admin')) THEN 'YES'
    WHEN EXISTS(SELECT 1 FROM account_administrators aa WHERE aa.user_id = u.id) THEN 'YES'
    ELSE 'NO'
  END as has_admin_access
FROM buybidhq_users u
WHERE u.email = 'USER_EMAIL_HERE';

-- STEP 6: Check recent changes to user data
-- =====================================================

-- Check if there were recent updates to the user
SELECT 
  'RECENT CHANGES CHECK' as check_type,
  id,
  email,
  role,
  app_role,
  created_at,
  updated_at
FROM buybidhq_users 
WHERE email = 'USER_EMAIL_HERE'
ORDER BY updated_at DESC;

-- Check audit logs if they exist
-- SELECT 
--   'AUDIT LOG CHECK' as check_type,
--   *
-- FROM audit_logs 
-- WHERE user_email = 'USER_EMAIL_HERE'
-- ORDER BY created_at DESC
-- LIMIT 10;

-- =====================================================
-- INSTRUCTIONS:
-- =====================================================
-- 1. Replace 'USER_EMAIL_HERE' with the actual user's email
-- 2. Run this script step by step
-- 3. Look for any results that show admin access
-- 4. If no results are found, the user might not exist in the database
-- 5. Check the browser console logs for more information
-- =====================================================
