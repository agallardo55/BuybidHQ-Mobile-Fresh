-- Script to check and fix user role assignments
-- This script will help identify why a user has admin access when they should be a free user

-- First, let's check what user we're dealing with
-- You'll need to replace 'USER_EMAIL_HERE' with the actual user's email

-- 1. Check if user exists in buybidhq_users table
SELECT 
    id, 
    email, 
    role, 
    app_role, 
    account_id,
    dealership_id,
    created_at
FROM buybidhq_users 
WHERE email = 'USER_EMAIL_HERE';

-- 2. Check if user has entries in user_roles table
SELECT 
    ur.user_id,
    ur.role,
    ur.is_active,
    ur.created_at
FROM user_roles ur
JOIN buybidhq_users u ON ur.user_id = u.id
WHERE u.email = 'USER_EMAIL_HERE';

-- 3. Check if user is in superadmin table
SELECT 
    user_id,
    email,
    status,
    created_at
FROM superadmin 
WHERE email = 'USER_EMAIL_HERE';

-- 4. Check if user is in account_administrators table
SELECT 
    aa.user_id,
    aa.account_id,
    aa.status,
    aa.created_at
FROM account_administrators aa
JOIN buybidhq_users u ON aa.user_id = u.id
WHERE u.email = 'USER_EMAIL_HERE';

-- 5. Check user's account information
SELECT 
    a.id,
    a.name,
    a.plan,
    a.seat_limit,
    a.billing_status
FROM accounts a
JOIN buybidhq_users u ON a.id = u.account_id
WHERE u.email = 'USER_EMAIL_HERE';

-- FIXES (run these after identifying the issues):

-- Fix 1: Remove user from superadmin table if they shouldn't be there
-- DELETE FROM superadmin WHERE email = 'USER_EMAIL_HERE';

-- Fix 2: Remove admin roles from user_roles table
-- DELETE FROM user_roles 
-- WHERE user_id = (SELECT id FROM buybidhq_users WHERE email = 'USER_EMAIL_HERE')
-- AND role IN ('super_admin', 'account_admin');

-- Fix 3: Update user's app_role to 'member' in buybidhq_users
-- UPDATE buybidhq_users 
-- SET app_role = 'member'
-- WHERE email = 'USER_EMAIL_HERE';

-- Fix 4: Remove user from account_administrators table if they shouldn't be there
-- DELETE FROM account_administrators 
-- WHERE user_id = (SELECT id FROM buybidhq_users WHERE email = 'USER_EMAIL_HERE');

-- Fix 5: Ensure user has a free account
-- UPDATE accounts 
-- SET plan = 'free', seat_limit = 1
-- WHERE id = (SELECT account_id FROM buybidhq_users WHERE email = 'USER_EMAIL_HERE');
