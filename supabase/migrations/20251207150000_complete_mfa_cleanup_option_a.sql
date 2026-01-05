-- ============================================================================
-- Complete MFA Cleanup - Option A: Supabase Native SMS MFA
-- ============================================================================
-- This migration:
-- 1. Migrates phone numbers from buybidhq_users.mobile_number to auth.users.phone
-- 2. Creates bidirectional sync triggers (TEMPORARY - see migration notes)
-- 3. Removes all old custom MFA tables, functions, triggers, and enums
-- 4. Preserves Supabase's native auth.mfa_* tables
--
-- TECHNICAL DEBT: Phones stored in two places with sync triggers
-- Future migration to Option B (custom SMS) documented in project notes
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: Migrate Phone Numbers to auth.users
-- ============================================================================

-- Migrate all phone numbers (not just sms_consent = true)
UPDATE auth.users au
SET 
  phone = bu.mobile_number,
  phone_confirmed_at = CASE 
    WHEN bu.phone_validated = true THEN COALESCE(bu.phone_validation_date, NOW())
    ELSE NULL
  END,
  updated_at = NOW()
FROM public.buybidhq_users bu
WHERE au.id = bu.id
  AND bu.mobile_number IS NOT NULL
  AND bu.mobile_number != ''
  AND (au.phone IS NULL OR au.phone != bu.mobile_number);

-- Log migration results
DO $$
DECLARE
  v_migrated integer;
BEGIN
  SELECT COUNT(*) INTO v_migrated 
  FROM auth.users 
  WHERE phone IS NOT NULL;
  
  RAISE NOTICE 'Phone migration complete: % users now have phones in auth.users', v_migrated;
END $$;

-- ============================================================================
-- PART 2: Create Bidirectional Phone Sync (TEMPORARY)
-- ============================================================================

-- Drop existing sync functions if they exist
DROP FUNCTION IF EXISTS public.sync_phone_to_auth() CASCADE;
DROP FUNCTION IF EXISTS public.sync_phone_from_auth() CASCADE;

-- Function: Sync buybidhq_users.mobile_number → auth.users.phone
CREATE OR REPLACE FUNCTION public.sync_phone_to_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NEW.mobile_number IS DISTINCT FROM OLD.mobile_number THEN
    UPDATE auth.users
    SET 
      phone = NEW.mobile_number,
      phone_confirmed_at = CASE 
        WHEN NEW.phone_validated = true THEN COALESCE(phone_confirmed_at, NOW())
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function: Sync auth.users.phone → buybidhq_users.mobile_number
CREATE OR REPLACE FUNCTION public.sync_phone_from_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.phone IS DISTINCT FROM OLD.phone THEN
    UPDATE public.buybidhq_users
    SET 
      mobile_number = NEW.phone,
      phone_validated = CASE 
        WHEN NEW.phone_confirmed_at IS NOT NULL THEN true
        ELSE phone_validated
      END,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS sync_phone_to_auth_trigger ON public.buybidhq_users;
CREATE TRIGGER sync_phone_to_auth_trigger
  AFTER UPDATE OF mobile_number ON public.buybidhq_users
  FOR EACH ROW
  WHEN (NEW.mobile_number IS DISTINCT FROM OLD.mobile_number)
  EXECUTE FUNCTION public.sync_phone_to_auth();

DROP TRIGGER IF EXISTS sync_phone_from_auth_trigger ON auth.users;
CREATE TRIGGER sync_phone_from_auth_trigger
  AFTER UPDATE OF phone ON auth.users
  FOR EACH ROW
  WHEN (NEW.phone IS DISTINCT FROM OLD.phone)
  EXECUTE FUNCTION public.sync_phone_from_auth();

-- Add comments documenting technical debt
COMMENT ON FUNCTION public.sync_phone_to_auth() IS 
'TECHNICAL DEBT: Bidirectional sync trigger. Keeps auth.users.phone in sync with buybidhq_users.mobile_number. Should be removed when migrating to Option B (custom SMS MFA using only buybidhq_users.mobile_number as source of truth). See project documentation for migration plan.';

COMMENT ON FUNCTION public.sync_phone_from_auth() IS 
'TECHNICAL DEBT: Bidirectional sync trigger. Keeps buybidhq_users.mobile_number in sync with auth.users.phone. Should be removed when migrating to Option B (custom SMS MFA using only buybidhq_users.mobile_number as source of truth). See project documentation for migration plan.';

-- ============================================================================
-- PART 3: Remove Old Custom MFA Infrastructure
-- ============================================================================

-- Drop old MFA triggers
DROP TRIGGER IF EXISTS on_buybidhq_user_created_mfa ON public.buybidhq_users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_mfa_settings_trigger ON auth.users;

-- Drop old MFA functions
DROP FUNCTION IF EXISTS public.create_mfa_settings() CASCADE;
DROP FUNCTION IF EXISTS public.create_mfa_verification(uuid, mfa_method) CASCADE;
DROP FUNCTION IF EXISTS public.generate_verification_code() CASCADE;
DROP FUNCTION IF EXISTS public.verify_mfa_code(uuid, character varying) CASCADE;
DROP FUNCTION IF EXISTS public.verify_mfa_code(TEXT) CASCADE;

-- Drop RLS policies on MFA tables
DROP POLICY IF EXISTS "Super admin read access to mfa settings" ON public.mfa_settings;
DROP POLICY IF EXISTS "Users can manage their own MFA settings" ON public.mfa_settings;
DROP POLICY IF EXISTS "Super admin access to mfa verifications" ON public.mfa_verifications;

-- Drop old MFA tables
DROP TABLE IF EXISTS public.mfa_verifications CASCADE;
DROP TABLE IF EXISTS public.mfa_settings CASCADE;

-- Drop old MFA enum types
DROP TYPE IF EXISTS public.mfa_method CASCADE;
DROP TYPE IF EXISTS public.mfa_status CASCADE;

-- Log cleanup completion
RAISE NOTICE 'MFA cleanup complete: tables, functions, triggers, and enums removed';

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify phone migration
SELECT 
  COUNT(*) as total_users,
  COUNT(phone) as users_with_phone,
  COUNT(phone_confirmed_at) as users_with_confirmed_phone
FROM auth.users;

-- Verify old MFA tables are gone
SELECT COUNT(*) as remaining_mfa_tables
FROM pg_tables
WHERE tablename IN ('mfa_settings', 'mfa_verifications')
  AND schemaname = 'public';

-- Should return 0









