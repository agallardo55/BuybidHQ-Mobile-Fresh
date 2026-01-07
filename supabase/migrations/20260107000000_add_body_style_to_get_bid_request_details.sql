-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_bid_request_details(uuid);

-- Recreate the function with body_style included
CREATE OR REPLACE FUNCTION public.get_bid_request_details(p_request_id uuid)
RETURNS TABLE(
  request_id uuid,
  created_at timestamp with time zone,
  status text,
  year text,
  make text,
  model text,
  trim_level text,
  vin text,
  mileage text,
  user_full_name text,
  engine_cylinders text,
  transmission text,
  drivetrain text,
  exterior_color text,
  interior_color text,
  accessories text,
  windshield text,
  engine_lights text,
  brakes text,
  tire text,
  maintenance text,
  recon_estimate text,
  recon_details text,
  body_style text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    br.id as request_id,
    br.created_at,
    br.status::text,
    v.year,
    v.make,
    v.model,
    v.trim as trim_level,
    v.vin,
    v.mileage,
    u.full_name as user_full_name,
    v.engine as engine_cylinders,
    v.transmission,
    v.drivetrain,
    v.exterior as exterior_color,
    v.interior as interior_color,
    v.options as accessories,
    r.windshield,
    r.engine_light as engine_lights,
    r.brakes,
    r.tires as tire,
    r.maintenance,
    r.recon_estimate,
    r.recon_details,
    v.body_style
  FROM bid_requests br
  JOIN vehicles v ON br.vehicle_id = v.id
  JOIN reconditioning r ON br.recon = r.id
  JOIN buybidhq_users u ON br.user_id = u.id
  WHERE br.id = p_request_id;
END;
$$;
