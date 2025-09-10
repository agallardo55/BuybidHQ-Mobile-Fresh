-- PHASE 3: Fix remaining critical security issues

-- Drop and recreate the security definer views without SECURITY DEFINER
DROP VIEW IF EXISTS public.buyers_user_roles_view CASCADE;
DROP VIEW IF EXISTS public.unified_dealer_info CASCADE;

-- Recreate buyers_user_roles_view as a standard view (security invoker)
CREATE VIEW public.buyers_user_roles_view AS
SELECT 
  id,
  role
FROM public.buybidhq_users
WHERE deleted_at IS NULL;

-- Recreate unified_dealer_info as a standard view (security invoker)  
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

-- Grant select permissions on the views
GRANT SELECT ON public.buyers_user_roles_view TO authenticated;
GRANT SELECT ON public.unified_dealer_info TO authenticated;

-- Enable RLS on mfa_settings (if not already enabled)
ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;

-- Add policy for mfa_settings
CREATE POLICY "Users can manage their own MFA settings" 
ON public.mfa_settings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add comments explaining the security model
COMMENT ON VIEW public.buyers_user_roles_view IS 'Standard view of user roles that respects RLS policies on buybidhq_users table';
COMMENT ON VIEW public.unified_dealer_info IS 'Standard view combining dealer information that respects RLS policies on underlying tables';