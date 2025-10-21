-- =====================================================
-- SCRIPT TO FIX USER ADMIN ACCESS ISSUE
-- =====================================================
-- This script will identify and fix users who have incorrect admin access
-- when they should be regular free users.

-- STEP 1: IDENTIFY THE PROBLEM USER
-- Replace 'USER_EMAIL_HERE' with the actual user's email address
-- =====================================================

-- Check current user data
SELECT 
    'CURRENT USER DATA' as check_type,
    id, 
    email, 
    role, 
    app_role, 
    account_id,
    dealership_id,
    created_at
FROM buybidhq_users 
WHERE email = 'USER_EMAIL_HERE';

-- Check user roles
SELECT 
    'USER ROLES' as check_type,
    ur.user_id,
    ur.role,
    ur.is_active,
    ur.created_at
FROM user_roles ur
JOIN buybidhq_users u ON ur.user_id = u.id
WHERE u.email = 'USER_EMAIL_HERE';

-- Check superadmin status
SELECT 
    'SUPER ADMIN' as check_type,
    user_id,
    email,
    status,
    created_at
FROM superadmin 
WHERE email = 'USER_EMAIL_HERE';

-- Check account administrators
SELECT 
    'ACCOUNT ADMIN' as check_type,
    aa.user_id,
    aa.account_id,
    aa.status,
    aa.created_at
FROM account_administrators aa
JOIN buybidhq_users u ON aa.user_id = u.id
WHERE u.email = 'USER_EMAIL_HERE';

-- Check account information
SELECT 
    'ACCOUNT INFO' as check_type,
    a.id,
    a.name,
    a.plan,
    a.seat_limit,
    a.billing_status
FROM accounts a
JOIN buybidhq_users u ON a.id = u.account_id
WHERE u.email = 'USER_EMAIL_HERE';

-- =====================================================
-- STEP 2: FIX THE ISSUES
-- Uncomment and run these fixes after identifying the problems
-- =====================================================

-- Fix 1: Remove user from superadmin table
-- DELETE FROM superadmin WHERE email = 'USER_EMAIL_HERE';

-- Fix 2: Remove admin roles from user_roles table
-- DELETE FROM user_roles 
-- WHERE user_id = (SELECT id FROM buybidhq_users WHERE email = 'USER_EMAIL_HERE')
-- AND role IN ('super_admin', 'account_admin');

-- Fix 3: Update user's app_role to 'member' in buybidhq_users
-- UPDATE buybidhq_users 
-- SET app_role = 'member'
-- WHERE email = 'USER_EMAIL_HERE';

-- Fix 4: Remove user from account_administrators table
-- DELETE FROM account_administrators 
-- WHERE user_id = (SELECT id FROM buybidhq_users WHERE email = 'USER_EMAIL_HERE');

-- Fix 5: Ensure user has a free account
-- UPDATE accounts 
-- SET plan = 'free', seat_limit = 1
-- WHERE id = (SELECT account_id FROM buybidhq_users WHERE email = 'USER_EMAIL_HERE');

-- Fix 6: Ensure user has basic role (not admin)
-- UPDATE buybidhq_users 
-- SET role = 'basic'
-- WHERE email = 'USER_EMAIL_HERE' AND role = 'admin';

-- =====================================================
-- STEP 3: VERIFY THE FIXES
-- Run these queries to confirm the fixes worked
-- =====================================================

-- Verify user data after fixes
-- SELECT 
--     'VERIFICATION - USER DATA' as check_type,
--     id, 
--     email, 
--     role, 
--     app_role, 
--     account_id,
--     dealership_id
-- FROM buybidhq_users 
-- WHERE email = 'USER_EMAIL_HERE';

-- Verify no admin roles remain
-- SELECT 
--     'VERIFICATION - USER ROLES' as check_type,
--     ur.user_id,
--     ur.role,
--     ur.is_active
-- FROM user_roles ur
-- JOIN buybidhq_users u ON ur.user_id = u.id
-- WHERE u.email = 'USER_EMAIL_HERE';

-- Verify not in superadmin table
-- SELECT 
--     'VERIFICATION - SUPER ADMIN' as check_type,
--     user_id,
--     email,
--     status
-- FROM superadmin 
-- WHERE email = 'USER_EMAIL_HERE';

-- Verify not in account_administrators table
-- SELECT 
--     'VERIFICATION - ACCOUNT ADMIN' as check_type,
--     aa.user_id,
--     aa.account_id,
--     aa.status
-- FROM account_administrators aa
-- JOIN buybidhq_users u ON aa.user_id = u.id
-- WHERE u.email = 'USER_EMAIL_HERE';

-- Verify account is free
-- SELECT 
--     'VERIFICATION - ACCOUNT INFO' as check_type,
--     a.id,
--     a.name,
--     a.plan,
--     a.seat_limit,
--     a.billing_status
-- FROM accounts a
-- JOIN buybidhq_users u ON a.id = u.account_id
-- WHERE u.email = 'USER_EMAIL_HERE';

-- =====================================================
-- INSTRUCTIONS:
-- =====================================================
-- 1. Replace 'USER_EMAIL_HERE' with the actual user's email address
-- 2. Run the STEP 1 queries first to identify the problems
-- 3. Uncomment and run the STEP 2 fixes based on what you found
-- 4. Run the STEP 3 verification queries to confirm the fixes worked
-- 5. The user should now show as a regular free user without admin access
-- =====================================================
