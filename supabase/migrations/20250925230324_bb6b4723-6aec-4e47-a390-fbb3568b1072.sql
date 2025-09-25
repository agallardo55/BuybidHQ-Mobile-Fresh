-- Update accounts to Free Plan for users with Member role
UPDATE accounts 
SET plan = 'free'
WHERE id IN (
  SELECT DISTINCT account_id 
  FROM buybidhq_users 
  WHERE app_role = 'member' 
  AND account_id IS NOT NULL
);

-- For users with Member role who don't have an account, create one with Free plan
INSERT INTO accounts (id, name, plan, seat_limit, feature_group_enabled, billing_status)
SELECT 
  gen_random_uuid(),
  COALESCE(u.full_name, 'Personal Account') as name,
  'free' as plan,
  1 as seat_limit,
  false as feature_group_enabled,
  'active' as billing_status
FROM buybidhq_users u
WHERE u.app_role = 'member' 
AND u.account_id IS NULL
ON CONFLICT DO NOTHING;

-- Update users to link them to their new accounts (for those who didn't have one)
UPDATE buybidhq_users 
SET account_id = (
  SELECT a.id 
  FROM accounts a 
  WHERE a.name = COALESCE(buybidhq_users.full_name, 'Personal Account')
  AND a.plan = 'free'
  LIMIT 1
)
WHERE app_role = 'member' 
AND account_id IS NULL;