-- ============================================================================
-- Auto-Create Accounts for New Users
-- ============================================================================
-- Purpose: Automatically create an account for each new user during signup
-- Date: 2026-01-07
-- ============================================================================

-- Step 1: Create trigger function to auto-create accounts
CREATE OR REPLACE FUNCTION public.create_account_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_account_id UUID;
  account_name TEXT;
BEGIN
  -- Only create account if user doesn't have one
  IF NEW.account_id IS NULL THEN
    -- Determine account name
    account_name := CASE
      WHEN NEW.full_name IS NOT NULL AND NEW.full_name != ''
      THEN NEW.full_name || '''s Account'
      ELSE NEW.email || '''s Account'
    END;

    -- Create new account
    INSERT INTO public.accounts (name, plan, billing_status)
    VALUES (account_name, 'free', 'active')
    RETURNING id INTO new_account_id;

    -- Update the user record with the new account_id
    NEW.account_id := new_account_id;

    RAISE LOG 'Auto-created account % (%) for user %', new_account_id, account_name, NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Step 2: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_user_created_create_account ON public.buybidhq_users;

-- Step 3: Create trigger on buybidhq_users
CREATE TRIGGER on_user_created_create_account
  BEFORE INSERT ON public.buybidhq_users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_account_for_new_user();

-- Step 4: Backfill accounts for existing users who don't have one
DO $$
DECLARE
  user_record RECORD;
  new_account_id UUID;
  account_name TEXT;
  users_processed INTEGER := 0;
BEGIN
  -- Loop through all users without an account_id
  FOR user_record IN
    SELECT id, email, full_name
    FROM public.buybidhq_users
    WHERE account_id IS NULL
    AND deleted_at IS NULL
  LOOP
    -- Determine account name
    account_name := CASE
      WHEN user_record.full_name IS NOT NULL AND user_record.full_name != ''
      THEN user_record.full_name || '''s Account'
      ELSE user_record.email || '''s Account'
    END;

    -- Create new account
    INSERT INTO public.accounts (name, plan, billing_status)
    VALUES (account_name, 'free', 'active')
    RETURNING id INTO new_account_id;

    -- Update user with new account_id
    UPDATE public.buybidhq_users
    SET account_id = new_account_id
    WHERE id = user_record.id;

    users_processed := users_processed + 1;

    RAISE NOTICE 'Backfilled account % (%) for user %', new_account_id, account_name, user_record.email;
  END LOOP;

  RAISE NOTICE 'Backfill complete: processed % users', users_processed;
END $$;

-- Step 5: Add comments for documentation
COMMENT ON FUNCTION public.create_account_for_new_user() IS
  'Trigger function that automatically creates an account for new users during signup. Creates a free plan account and links it to the user.';

COMMENT ON TRIGGER on_user_created_create_account ON public.buybidhq_users IS
  'Automatically creates an account for each new user. Ensures all users have an account from day one.';

-- Step 6: Verify all users now have accounts
DO $$
DECLARE
  orphaned_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_users
  FROM public.buybidhq_users
  WHERE account_id IS NULL
  AND deleted_at IS NULL;

  IF orphaned_users > 0 THEN
    RAISE WARNING 'Still have % users without accounts!', orphaned_users;
  ELSE
    RAISE NOTICE 'Success: All active users now have accounts';
  END IF;
END $$;
