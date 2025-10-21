-- Fix user profile creation with proper trigger and migration
-- This migration addresses the missing trigger that should create buybidhq_users records

-- Step 1: Update the sync_user_id function to handle full user data
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
      address,
      city,
      state,
      zip_code,
      phone_carrier,
      profile_photo,
      bid_request_email_enabled,
      bid_request_sms_enabled,
      status
    )
    VALUES (
      NEW.id, 
      NEW.email, 
      'basic', 
      'member',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'mobile_number',
      NEW.raw_user_meta_data->>'address',
      NEW.raw_user_meta_data->>'city',
      NEW.raw_user_meta_data->>'state',
      NEW.raw_user_meta_data->>'zip_code',
      NEW.raw_user_meta_data->>'phone_carrier',
      NEW.raw_user_meta_data->>'profile_photo',
      true,  -- bid_request_email_enabled
      false, -- bid_request_sms_enabled
      'active'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Step 2: Create the missing trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_id();

-- Step 3: Migrate existing users who are missing profiles
INSERT INTO buybidhq_users (
  id, 
  email, 
  role, 
  app_role, 
  full_name,
  mobile_number,
  address,
  city,
  state,
  zip_code,
  phone_carrier,
  profile_photo,
  bid_request_email_enabled,
  bid_request_sms_enabled,
  status
)
SELECT 
  au.id, 
  au.email, 
  'basic', 
  'member',
  au.raw_user_meta_data->>'full_name',
  au.raw_user_meta_data->>'mobile_number',
  au.raw_user_meta_data->>'address',
  au.raw_user_meta_data->>'city',
  au.raw_user_meta_data->>'state',
  au.raw_user_meta_data->>'zip_code',
  au.raw_user_meta_data->>'phone_carrier',
  au.raw_user_meta_data->>'profile_photo',
  true,  -- bid_request_email_enabled
  false, -- bid_request_sms_enabled
  'active'
FROM auth.users au
LEFT JOIN buybidhq_users bu ON au.id = bu.id
WHERE bu.id IS NULL
AND au.email_confirmed_at IS NOT NULL; -- Only confirmed users

-- Add comment for documentation
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Automatically creates buybidhq_users profile when auth.users record is created';
