-- Fix Security Definer View issue by changing view ownership
-- Views owned by postgres superuser can bypass RLS, creating security risks

-- Drop and recreate views with proper ownership to avoid superuser privileges

-- 1. Drop existing views
DROP VIEW IF EXISTS public.buyers_user_roles_view CASCADE;
DROP VIEW IF EXISTS public.unified_dealer_info CASCADE;

-- 2. Recreate buyers_user_roles_view with proper security
CREATE VIEW public.buyers_user_roles_view 
WITH (security_invoker = true) AS
SELECT 
  id,
  role
FROM public.buybidhq_users
WHERE deleted_at IS NULL;

-- 3. Recreate unified_dealer_info with proper security  
CREATE VIEW public.unified_dealer_info 
WITH (security_invoker = true) AS
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

-- 4. Change ownership to authenticator role (non-superuser)
ALTER VIEW public.buyers_user_roles_view OWNER TO authenticator;
ALTER VIEW public.unified_dealer_info OWNER TO authenticator;

-- 5. Grant appropriate permissions
GRANT SELECT ON public.buyers_user_roles_view TO authenticated;
GRANT SELECT ON public.unified_dealer_info TO authenticated;

-- 6. Verify the fix
SELECT 
  schemaname,
  viewname,
  viewowner,
  'SECURITY FIXED - No longer superuser owned' as status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;