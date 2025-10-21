-- =====================================================
-- SCRIPT TO FIND ALL USERS WITH INCORRECT ADMIN ACCESS
-- =====================================================
-- This script will identify all users who have admin access
-- but should probably be regular free users

-- Find users who have admin access but are on free plans
SELECT 
  'USERS WITH ADMIN ACCESS ON FREE PLANS' as issue_type,
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
WHERE (
  u.app_role IN ('super_admin', 'account_admin') 
  OR u.role = 'admin'
  OR EXISTS(SELECT 1 FROM superadmin WHERE email = u.email)
  OR EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role IN ('super_admin', 'account_admin'))
  OR EXISTS(SELECT 1 FROM account_administrators aa WHERE aa.user_id = u.id)
)
AND (a.plan = 'free' OR a.plan IS NULL)
ORDER BY u.created_at DESC;

-- Find users with multiple admin role assignments (potential conflicts)
SELECT 
  'USERS WITH MULTIPLE ADMIN ASSIGNMENTS' as issue_type,
  u.id,
  u.email,
  u.role,
  u.app_role,
  a.plan as account_plan,
  COUNT(CASE WHEN ur.role IN ('super_admin', 'account_admin') THEN 1 END) as admin_role_count,
  COUNT(CASE WHEN aa.user_id IS NOT NULL THEN 1 END) as account_admin_count,
  CASE WHEN EXISTS(SELECT 1 FROM superadmin WHERE email = u.email) THEN 'YES' ELSE 'NO' END as in_superadmin
FROM buybidhq_users u
LEFT JOIN accounts a ON u.account_id = a.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN account_administrators aa ON u.id = aa.user_id
WHERE (
  u.app_role IN ('super_admin', 'account_admin') 
  OR u.role = 'admin'
  OR EXISTS(SELECT 1 FROM superadmin WHERE email = u.email)
  OR EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role IN ('super_admin', 'account_admin'))
  OR EXISTS(SELECT 1 FROM account_administrators aa WHERE aa.user_id = u.id)
)
GROUP BY u.id, u.email, u.role, u.app_role, a.plan
HAVING (
  COUNT(CASE WHEN ur.role IN ('super_admin', 'account_admin') THEN 1 END) > 1
  OR (COUNT(CASE WHEN ur.role IN ('super_admin', 'account_admin') THEN 1 END) > 0 AND EXISTS(SELECT 1 FROM superadmin WHERE email = u.email))
  OR (COUNT(CASE WHEN aa.user_id IS NOT NULL THEN 1 END) > 0 AND EXISTS(SELECT 1 FROM superadmin WHERE email = u.email))
)
ORDER BY u.created_at DESC;

-- Find users who might be test accounts with admin access
SELECT 
  'POTENTIAL TEST ACCOUNTS WITH ADMIN ACCESS' as issue_type,
  u.id,
  u.email,
  u.role,
  u.app_role,
  a.plan as account_plan,
  u.created_at
FROM buybidhq_users u
LEFT JOIN accounts a ON u.account_id = a.id
WHERE (
  u.app_role IN ('super_admin', 'account_admin') 
  OR u.role = 'admin'
  OR EXISTS(SELECT 1 FROM superadmin WHERE email = u.email)
  OR EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role IN ('super_admin', 'account_admin'))
  OR EXISTS(SELECT 1 FROM account_administrators aa WHERE aa.user_id = u.id)
)
AND (
  u.email LIKE '%test%' 
  OR u.email LIKE '%admin%' 
  OR u.email LIKE '%demo%'
  OR u.email LIKE '%example%'
  OR u.email LIKE '%@test.%'
  OR u.email LIKE '%@example.%'
)
ORDER BY u.created_at DESC;

-- Summary count of admin users by type
SELECT 
  'ADMIN USER SUMMARY' as summary_type,
  COUNT(*) as total_users,
  COUNT(CASE WHEN u.app_role = 'super_admin' THEN 1 END) as super_admin_count,
  COUNT(CASE WHEN u.app_role = 'account_admin' THEN 1 END) as account_admin_count,
  COUNT(CASE WHEN u.role = 'admin' THEN 1 END) as legacy_admin_count,
  COUNT(CASE WHEN EXISTS(SELECT 1 FROM superadmin WHERE email = u.email) THEN 1 END) as in_superadmin_table,
  COUNT(CASE WHEN EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role IN ('super_admin', 'account_admin')) THEN 1 END) as has_admin_roles,
  COUNT(CASE WHEN EXISTS(SELECT 1 FROM account_administrators aa WHERE aa.user_id = u.id) THEN 1 END) as in_account_admins
FROM buybidhq_users u
WHERE (
  u.app_role IN ('super_admin', 'account_admin') 
  OR u.role = 'admin'
  OR EXISTS(SELECT 1 FROM superadmin WHERE email = u.email)
  OR EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role IN ('super_admin', 'account_admin'))
  OR EXISTS(SELECT 1 FROM account_administrators aa WHERE aa.user_id = u.id)
);
