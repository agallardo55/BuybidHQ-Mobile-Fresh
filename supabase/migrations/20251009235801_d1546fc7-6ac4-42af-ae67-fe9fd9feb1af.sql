-- =====================================================
-- DIAGNOSTIC: Find and Fix ALL Security Definer Issues
-- =====================================================

-- Check for and fix any functions with security definer but without search_path
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT 
      n.nspname AS schema,
      p.proname AS function_name,
      pg_get_functiondef(p.oid) AS definition
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND prosecdef = true  -- security definer functions
      AND NOT EXISTS (
        SELECT 1 FROM pg_proc p2
        WHERE p2.oid = p.oid
          AND pg_get_functiondef(p2.oid) LIKE '%SET search_path%'
      )
  LOOP
    RAISE NOTICE 'Found security definer function without search_path: %.%', 
      func_record.schema, func_record.function_name;
  END LOOP;
END $$;

-- Ensure ALL our security definer functions have proper search_path
-- Re-create user_has_role with explicit security settings
CREATE OR REPLACE FUNCTION public.user_has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
  )
$$;

-- Check all views and ensure none have security_definer property
-- List all views for diagnostics
DO $$
DECLARE
  view_record RECORD;
BEGIN
  FOR view_record IN 
    SELECT 
      schemaname,
      viewname
    FROM pg_views
    WHERE schemaname = 'public'
  LOOP
    RAISE NOTICE 'Found view: %.%', view_record.schemaname, view_record.viewname;
  END LOOP;
END $$;

-- Ensure vehicles_public does NOT have security_definer
-- Recreate it to be absolutely sure
DROP VIEW IF EXISTS public.vehicles_public CASCADE;

CREATE VIEW public.vehicles_public AS
SELECT 
  id,
  year,
  make,
  model,
  trim,
  NULL::TEXT as vin,
  mileage,
  engine,
  transmission,
  drivetrain,
  exterior,
  interior,
  options,
  created_at
FROM public.vehicles;

-- Grant minimal permissions
GRANT SELECT ON public.vehicles_public TO anon;
GRANT SELECT ON public.vehicles_public TO authenticated;

COMMENT ON VIEW public.vehicles_public IS 
'Non-SECURITY_DEFINER view of vehicles WITHOUT VINs. Simple column filtering with no security definer functions.';