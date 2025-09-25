-- Consolidate Primary Dealer to Account Admin (Fixed)
-- Step 1: Migrate existing primary dealers to account administrators

-- First, insert primary dealers into account_administrators table with null handling
INSERT INTO account_administrators (
  user_id,
  account_id,
  email,
  full_name,
  mobile_number,
  status,
  granted_by,
  granted_at
)
SELECT DISTINCT
  d.primary_user_id as user_id,
  u.account_id,
  u.email,
  COALESCE(u.full_name, 'Primary Dealer') as full_name, -- Handle null full_name
  u.mobile_number,
  'active' as status,
  d.primary_user_id as granted_by, -- Self-granted for existing primary dealers
  COALESCE(d.primary_assigned_at, now()) as granted_at
FROM dealerships d
JOIN buybidhq_users u ON d.primary_user_id = u.id
WHERE d.primary_user_id IS NOT NULL
AND d.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM account_administrators aa 
  WHERE aa.user_id = d.primary_user_id 
  AND aa.account_id = u.account_id
);

-- Step 2: Update app_role to account_admin for primary dealers
UPDATE buybidhq_users 
SET app_role = 'account_admin'
WHERE id IN (
  SELECT DISTINCT primary_user_id 
  FROM dealerships 
  WHERE primary_user_id IS NOT NULL 
  AND is_active = true
)
AND app_role != 'account_admin';

-- Step 3: Create new functions to replace primary dealer logic
CREATE OR REPLACE FUNCTION public.is_dealership_admin(checking_user_id uuid, target_dealership_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM account_administrators aa
    JOIN buybidhq_users u ON aa.user_id = u.id
    WHERE aa.user_id = checking_user_id 
    AND u.dealership_id = target_dealership_id
    AND aa.status = 'active'
  );
$$;

-- Step 4: Update existing functions that used primary dealer logic
CREATE OR REPLACE FUNCTION public.can_manage_dealership(checking_user_id uuid, target_dealership_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    is_super_admin(checking_user_id) OR 
    is_dealership_admin(checking_user_id, target_dealership_id);
$$;

-- Step 5: Add columns to track migration
ALTER TABLE dealerships 
ADD COLUMN IF NOT EXISTS migrated_to_account_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS migration_date timestamp with time zone;

-- Mark migrated dealerships
UPDATE dealerships 
SET 
  migrated_to_account_admin = true,
  migration_date = now()
WHERE primary_user_id IS NOT NULL;