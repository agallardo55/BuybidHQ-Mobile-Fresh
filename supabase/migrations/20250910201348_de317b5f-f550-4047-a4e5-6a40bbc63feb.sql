-- Completely recreate all views to ensure no SECURITY DEFINER properties

-- Drop all views first to clear any potential cached issues
DROP VIEW IF EXISTS public.buyers_user_roles_view CASCADE;
DROP VIEW IF EXISTS public.unified_dealer_info CASCADE;

-- Recreate buyers_user_roles_view with explicit SECURITY INVOKER (default)
CREATE VIEW public.buyers_user_roles_view
SECURITY INVOKER
AS
SELECT 
  id,
  role
FROM public.buybidhq_users
WHERE deleted_at IS NULL;

-- Recreate unified_dealer_info with explicit SECURITY INVOKER (default)
CREATE VIEW public.unified_dealer_info
SECURITY INVOKER
AS
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

-- Grant select permissions
GRANT SELECT ON public.buyers_user_roles_view TO authenticated;
GRANT SELECT ON public.unified_dealer_info TO authenticated;

-- Add explicit comments
COMMENT ON VIEW public.buyers_user_roles_view IS 'Security invoker view of user roles that respects RLS policies';
COMMENT ON VIEW public.unified_dealer_info IS 'Security invoker view combining dealer information that respects RLS policies';