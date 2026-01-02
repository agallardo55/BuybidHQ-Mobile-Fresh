-- Ensure user profile creation trigger exists and works correctly
-- This trigger automatically creates buybidhq_users record when auth.users is created

-- Step 1: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Create or replace the sync function
CREATE OR REPLACE FUNCTION public.sync_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If user doesn't exist in buybidhq_users, create them
  IF NOT EXISTS (SELECT 1 FROM buybidhq_users WHERE id = NEW.id) THEN
    INSERT INTO buybidhq_users (
      id,
      email,
      role,
      app_role,
      full_name,
      mobile_number,
      is_active,
      status
    )
    VALUES (
      NEW.id,
      NEW.email,
      'basic',
      'member',  -- Will be updated to 'account_admin' during signup
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'mobile_number', ''),
      true,
      'active'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_id();

-- Step 4: Backfill any existing users missing from buybidhq_users
INSERT INTO buybidhq_users (
  id,
  email,
  role,
  app_role,
  full_name,
  mobile_number,
  is_active,
  status
)
SELECT
  au.id,
  au.email,
  'basic',
  'member',
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  COALESCE(au.raw_user_meta_data->>'mobile_number', ''),
  true,
  'active'
FROM auth.users au
LEFT JOIN buybidhq_users bu ON au.id = bu.id
WHERE bu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
  'Automatically creates buybidhq_users profile when auth.users record is created';

COMMENT ON FUNCTION public.sync_user_id() IS
  'Trigger function that creates buybidhq_users record for new auth.users';
