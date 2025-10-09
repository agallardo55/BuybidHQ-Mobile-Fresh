-- =====================================================
-- FIX: Remove Security Definer, Exclude VINs Completely for Anon
-- =====================================================

-- Drop the security definer function and view
DROP VIEW IF EXISTS public.vehicles_public;
DROP FUNCTION IF EXISTS public.mask_vin(TEXT, BOOLEAN);

-- Create simple view that EXCLUDES VIN entirely for public access
-- No security definer needed - just column filtering
CREATE VIEW public.vehicles_public AS
SELECT 
  id,
  year,
  make,
  model,
  trim,
  NULL::TEXT as vin, -- VIN completely hidden for anon users
  mileage,
  engine,
  transmission,
  drivetrain,
  exterior,
  interior,
  options,
  created_at
FROM public.vehicles;

-- Grant SELECT on the VIN-less view to anon
GRANT SELECT ON public.vehicles_public TO anon;

-- Ensure anon has NO access to base vehicles table
REVOKE ALL ON public.vehicles FROM anon;

COMMENT ON VIEW public.vehicles_public IS 
'Public view of vehicles WITHOUT VINs. VIN column returns NULL for all users querying this view. Authenticated users should query the vehicles table directly (subject to RLS). This prevents VIN exposure in public carousel.';