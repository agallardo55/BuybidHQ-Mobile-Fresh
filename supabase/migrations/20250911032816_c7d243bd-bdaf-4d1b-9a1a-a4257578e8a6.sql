-- Fix Security Definer View issue with explicit SECURITY INVOKER
-- Ensure views respect RLS policies and don't bypass security

-- 1. Drop existing potentially insecure views
DROP VIEW IF EXISTS public.buyers_user_roles_view CASCADE;
DROP VIEW IF EXISTS public.unified_dealer_info CASCADE;

-- 2. Recreate buyers_user_roles_view with explicit SECURITY INVOKER
-- This ensures the view uses the permissions of the calling user, not the view owner
CREATE VIEW public.buyers_user_roles_view AS
SELECT 
  id,
  role
FROM public.buybidhq_users
WHERE deleted_at IS NULL;

-- Explicitly set security_invoker option (PostgreSQL 15+ feature)
ALTER VIEW public.buyers_user_roles_view SET (security_invoker = on);

-- 3. Recreate unified_dealer_info with explicit SECURITY INVOKER
CREATE VIEW public.unified_dealer_info AS
SELECT 
  d.id,
  d.primary_user_id AS user_id,
  d.dealer_type,
  d.dealer_name AS business_name,
  d.dealer_id AS license_number,
  d.business_phone,
  d.business_email,
  d.address,
  d.city,
  d.state,
  d.zip_code
FROM public.dealerships d
WHERE d.dealer_type = 'multi_user'
  AND d.is_active = true

UNION ALL

SELECT 
  ind.id,
  ind.user_id,
  'individual'::dealer_type AS dealer_type,
  ind.business_name,
  ind.license_number,
  ind.business_phone,
  ind.business_email,
  ind.address,
  ind.city,
  ind.state,
  ind.zip_code
FROM public.individual_dealers ind;

-- Explicitly set security_invoker option
ALTER VIEW public.unified_dealer_info SET (security_invoker = on);

-- 4. Grant appropriate permissions
GRANT SELECT ON public.buyers_user_roles_view TO authenticated;
GRANT SELECT ON public.unified_dealer_info TO authenticated;

-- 5. Add comments to document the security configuration
COMMENT ON VIEW public.buyers_user_roles_view IS 'Security: Uses SECURITY INVOKER to respect caller permissions and RLS policies';
COMMENT ON VIEW public.unified_dealer_info IS 'Security: Uses SECURITY INVOKER to respect caller permissions and RLS policies';

-- 6. Verify the security configuration
SELECT 
  schemaname,
  viewname,
  viewowner,
  'SECURITY INVOKER CONFIGURED' as security_status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;