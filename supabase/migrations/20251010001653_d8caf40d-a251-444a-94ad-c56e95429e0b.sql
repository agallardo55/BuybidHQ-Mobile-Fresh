-- =====================================================
-- FIX: Security Definer View Warning
-- Change vehicles_public view to SECURITY INVOKER
-- =====================================================

-- Drop and recreate the view with SECURITY INVOKER
DROP VIEW IF EXISTS public.vehicles_public;

CREATE VIEW public.vehicles_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  year,
  make,
  model,
  trim,
  NULL::text AS vin,  -- VIN hidden for public view
  mileage,
  engine,
  transmission,
  drivetrain,
  exterior,
  interior,
  options,
  created_at
FROM vehicles;

-- Grant SELECT to authenticated users only
GRANT SELECT ON public.vehicles_public TO authenticated;

COMMENT ON VIEW public.vehicles_public IS 
'Public vehicle view with VIN masked. Uses SECURITY INVOKER to respect RLS policies of querying user.';