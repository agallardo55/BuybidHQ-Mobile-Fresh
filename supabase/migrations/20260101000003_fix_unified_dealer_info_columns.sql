-- Fix unified_dealer_info view to match Dealership type interface
-- Change business_name → dealer_name and license_number → dealer_id

DROP VIEW IF EXISTS public.unified_dealer_info CASCADE;

CREATE VIEW public.unified_dealer_info AS
SELECT
  d.id,
  d.primary_user_id AS user_id,
  d.dealer_type,
  d.dealer_name,
  d.dealer_id,
  d.business_phone,
  d.business_email,
  d.address,
  d.city,
  d.state,
  d.zip_code,
  d.license_number,
  d.website,
  d.notes,
  d.is_active,
  d.created_at,
  d.last_updated_at,
  d.last_updated_by,
  d.primary_assigned_at
FROM public.dealerships d
WHERE d.dealer_type = 'multi_user'
  AND d.is_active = true

UNION ALL

SELECT
  ind.id,
  ind.user_id,
  'individual'::dealer_type AS dealer_type,
  ind.business_name AS dealer_name,
  ind.license_number AS dealer_id,
  ind.business_phone,
  ind.business_email,
  ind.address,
  ind.city,
  ind.state,
  ind.zip_code,
  ind.license_number,
  NULL::TEXT AS website,
  NULL::TEXT AS notes,
  true AS is_active,
  ind.created_at,
  ind.updated_at AS last_updated_at,
  NULL::UUID AS last_updated_by,
  NULL::TIMESTAMPTZ AS primary_assigned_at
FROM public.individual_dealers ind;

-- Set security invoker to respect RLS policies
ALTER VIEW public.unified_dealer_info SET (security_invoker = on);

-- Grant permissions
GRANT SELECT ON public.unified_dealer_info TO authenticated;

COMMENT ON VIEW public.unified_dealer_info IS
  'Unified view of all dealers (both individual and multi-user dealerships).
   Uses SECURITY INVOKER to respect caller permissions and RLS policies.
   Matches Dealership type interface with dealer_name and dealer_id fields.';
