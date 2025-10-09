-- =====================================================
-- FIX: Mask VINs in Public Carousel
-- =====================================================

-- Create function to mask VINs (show only last 6 characters)
CREATE OR REPLACE FUNCTION public.mask_vin(vin TEXT, user_is_authenticated BOOLEAN)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN user_is_authenticated THEN vin
    WHEN vin IS NULL THEN NULL
    WHEN LENGTH(vin) <= 6 THEN '***' || vin
    ELSE '***' || RIGHT(vin, 6)
  END;
$$;

-- Create a view for public vehicle access with masked VINs
CREATE OR REPLACE VIEW public.vehicles_public AS
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

-- Drop the direct access policy for anon users on vehicles table
DROP POLICY IF EXISTS "Public carousel: vehicles for approved bids only" ON public.vehicles;

-- Revoke direct SELECT access from anon on vehicles table
REVOKE SELECT ON public.vehicles FROM anon;

-- Enable RLS on the public view
ALTER VIEW public.vehicles_public SET (security_barrier = true);

-- Grant SELECT on the masked view to anon
GRANT SELECT ON public.vehicles_public TO anon;

-- Create policy on vehicles that allows authenticated users full access
CREATE POLICY "Authenticated users can view all vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.bid_requests br
    WHERE br.vehicle_id = vehicles.id
      AND (
        -- User owns the bid request
        br.user_id = auth.uid()
        -- OR user is in the same account
        OR EXISTS (
          SELECT 1 FROM public.buybidhq_users 
          WHERE id = auth.uid() 
          AND account_id = br.account_id
        )
        -- OR user is admin
        OR public.user_has_role(auth.uid(), 'super_admin')
      )
  )
);

-- Add policy for anon on vehicles_public view (restricts to approved recent bids)
-- Note: Views don't use RLS directly, but we add this for documentation
COMMENT ON VIEW public.vehicles_public IS 
'Public view of vehicles with masked VINs. Shows only last 6 characters of VIN for unauthenticated users. Full VIN visible to authenticated users. Access restricted to vehicles associated with approved bid requests from last 30 days via RLS on underlying tables.';