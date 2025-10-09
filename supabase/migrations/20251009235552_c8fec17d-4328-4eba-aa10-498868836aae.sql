-- =====================================================
-- FIX: Security warnings on mask_vin function and view
-- =====================================================

-- Fix mask_vin function: add search_path for security
CREATE OR REPLACE FUNCTION public.mask_vin(vin TEXT, user_is_authenticated BOOLEAN)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN user_is_authenticated THEN vin
    WHEN vin IS NULL THEN NULL
    WHEN LENGTH(vin) <= 6 THEN '***' || vin
    ELSE '***' || RIGHT(vin, 6)
  END;
$$;

-- Recreate vehicles_public view with correct security settings
DROP VIEW IF EXISTS public.vehicles_public;

CREATE VIEW public.vehicles_public
WITH (security_barrier = true)
AS
SELECT 
  id,
  year,
  make,
  model,
  trim,
  mask_vin(vin, auth.uid() IS NOT NULL) as vin,
  mileage,
  engine,
  transmission,
  drivetrain,
  exterior,
  interior,
  options,
  created_at
FROM public.vehicles;

GRANT SELECT ON public.vehicles_public TO anon;

COMMENT ON VIEW public.vehicles_public IS 
'Public view of vehicles with masked VINs. Shows only last 6 characters of VIN for unauthenticated users. Full VIN visible to authenticated users. Uses security_barrier to prevent policy bypass.';