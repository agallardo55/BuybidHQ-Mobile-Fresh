-- =====================================================
-- QUICK FIX SCRIPT FOR USER ADMIN ACCESS ISSUE
-- =====================================================
-- Replace 'USER_EMAIL_HERE' with the actual user's email address
-- This script will fix all common admin access issues at once

-- Get the user ID for the email
WITH user_info AS (
  SELECT id, account_id FROM buybidhq_users WHERE email = 'USER_EMAIL_HERE'
)

-- Fix all issues in one transaction
UPDATE buybidhq_users 
SET 
  app_role = 'member',
  role = CASE WHEN role = 'admin' THEN 'basic' ELSE role END
WHERE email = 'USER_EMAIL_HERE';

-- Remove from superadmin table
DELETE FROM superadmin WHERE email = 'USER_EMAIL_HERE';

-- Remove admin roles from user_roles table
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM buybidhq_users WHERE email = 'USER_EMAIL_HERE')
AND role IN ('super_admin', 'account_admin');

-- Remove from account_administrators table
DELETE FROM account_administrators 
WHERE user_id = (SELECT id FROM buybidhq_users WHERE email = 'USER_EMAIL_HERE');

-- Set account to free plan
UPDATE accounts 
SET plan = 'free', seat_limit = 1
WHERE id = (SELECT account_id FROM buybidhq_users WHERE email = 'USER_EMAIL_HERE');

-- Verify the fixes
SELECT 
  'FINAL VERIFICATION' as status,
  u.id,
  u.email,
  u.role,
  u.app_role,
  a.plan as account_plan,
  CASE WHEN EXISTS(SELECT 1 FROM superadmin WHERE email = u.email) THEN 'YES' ELSE 'NO' END as in_superadmin,
  CASE WHEN EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role IN ('super_admin', 'account_admin')) THEN 'YES' ELSE 'NO' END as has_admin_roles,
  CASE WHEN EXISTS(SELECT 1 FROM account_administrators aa WHERE aa.user_id = u.id) THEN 'YES' ELSE 'NO' END as in_account_admins
FROM buybidhq_users u
LEFT JOIN accounts a ON u.account_id = a.id
WHERE u.email = 'USER_EMAIL_HERE';
