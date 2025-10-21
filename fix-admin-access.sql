-- =====================================================
-- FIX ADMIN ACCESS ISSUE
-- =====================================================
-- This script helps fix users who have incorrect admin access
-- when they should be free members.
-- 
-- Usage: Replace 'USER_EMAIL_HERE' with the actual user email
-- =====================================================

-- Set the user email to fix (replace with actual email)
\set user_email 'USER_EMAIL_HERE'

-- =====================================================
-- STEP 1: IDENTIFY THE USER
-- =====================================================

-- Get user ID from auth.users
SELECT 
  'User ID from auth.users:' as step,
  id as user_id,
  email,
  created_at
FROM auth.users 
WHERE email = :'user_email';

-- =====================================================
-- STEP 2: CHECK CURRENT ADMIN STATUS
-- =====================================================

-- Check buybidhq_users table
SELECT 
  'buybidhq_users data:' as step,
  id,
  email,
  role,
  app_role,
  account_id,
  dealership_id,
  is_active,
  deleted_at
FROM buybidhq_users 
WHERE email = :'user_email';

-- Check legacy superadmin table
SELECT 
  'Legacy superadmin table:' as step,
  email,
  status,
  created_at,
  updated_at
FROM superadmin 
WHERE email = :'user_email';

-- Check new super_administrators table
SELECT 
  'super_administrators table:' as step,
  user_id,
  email,
  status,
  granted_by,
  granted_at
FROM super_administrators sa
JOIN auth.users au ON sa.user_id = au.id
WHERE au.email = :'user_email';

-- Check account_administrators table
SELECT 
  'account_administrators table:' as step,
  user_id,
  account_id,
  email,
  status,
  granted_by,
  granted_at
FROM account_administrators aa
JOIN auth.users au ON aa.user_id = au.id
WHERE au.email = :'user_email';

-- Check user_roles table
SELECT 
  'user_roles table:' as step,
  user_id,
  role,
  is_active,
  granted_at,
  expires_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = :'user_email';

-- =====================================================
-- STEP 3: TEST ADMIN FUNCTIONS
-- =====================================================

-- Test is_superadmin function
SELECT 
  'is_superadmin test:' as step,
  is_superadmin(:'user_email') as result;

-- Test is_super_admin function (requires user_id)
SELECT 
  'is_super_admin test:' as step,
  is_super_admin(au.id) as result
FROM auth.users au
WHERE au.email = :'user_email';

-- Test is_admin function (requires user_id)
SELECT 
  'is_admin test:' as step,
  is_admin(au.id) as result
FROM auth.users au
WHERE au.email = :'user_email';

-- =====================================================
-- STEP 4: FIX ADMIN ACCESS (UNCOMMENT TO EXECUTE)
-- =====================================================

-- WARNING: Only uncomment and run these if you want to remove admin access!

/*
-- Fix 1: Update buybidhq_users role to basic (for free members)
UPDATE buybidhq_users 
SET 
  role = 'basic',
  app_role = 'member',
  updated_at = NOW()
WHERE email = :'user_email'
AND role = 'admin';

-- Fix 2: Remove from legacy superadmin table
DELETE FROM superadmin 
WHERE email = :'user_email';

-- Fix 3: Remove from super_administrators table
DELETE FROM super_administrators 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = :'user_email'
);

-- Fix 4: Remove from account_administrators table
DELETE FROM account_administrators 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = :'user_email'
);

-- Fix 5: Update user_roles table (remove admin roles, add member role)
DELETE FROM user_roles 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = :'user_email'
)
AND role IN ('super_admin', 'account_admin', 'manager');

-- Add member role
INSERT INTO user_roles (user_id, role, granted_at, is_active)
SELECT 
  au.id,
  'member',
  NOW(),
  true
FROM auth.users au
WHERE au.email = :'user_email'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = au.id AND ur.role = 'member'
);
*/

-- =====================================================
-- STEP 5: VERIFY FIXES (RUN AFTER APPLYING FIXES)
-- =====================================================

-- Verify admin functions return false
SELECT 
  'Verification - is_superadmin:' as step,
  is_superadmin(:'user_email') as result;

SELECT 
  'Verification - is_super_admin:' as step,
  is_super_admin(au.id) as result
FROM auth.users au
WHERE au.email = :'user_email';

SELECT 
  'Verification - is_admin:' as step,
  is_admin(au.id) as result
FROM auth.users au
WHERE au.email = :'user_email';

-- Verify user data
SELECT 
  'Verification - buybidhq_users:' as step,
  role,
  app_role,
  is_active
FROM buybidhq_users 
WHERE email = :'user_email';

SELECT 
  'Verification - user_roles:' as step,
  role,
  is_active
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = :'user_email';
