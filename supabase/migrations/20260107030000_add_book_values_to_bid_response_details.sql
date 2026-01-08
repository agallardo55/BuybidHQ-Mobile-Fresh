-- Add book values to get_bid_response_details function
-- This ensures the public bid response page shows book values correctly

DROP FUNCTION IF EXISTS public.get_bid_response_details(uuid);

CREATE OR REPLACE FUNCTION public.get_bid_response_details(bid_response_id uuid)
RETURNS TABLE(
  response_id uuid,
  request_id uuid,
  year text,
  make text,
  model text,
  trim_level text,
  vin text,
  mileage text,
  exterior_color text,
  interior_color text,
  windshield text,
  engine_lights text,
  brakes text,
  tire text,
  maintenance text,
  recon_estimate text,
  recon_details text,
  accessories text,
  transmission text,
  engine_cylinders text,
  drivetrain text,
  user_full_name text,
  dealership text,
  mobile_number text,
  offer_amount numeric,
  status text,
  -- Book values fields
  mmr_wholesale numeric,
  mmr_retail numeric,
  kbb_wholesale numeric,
  kbb_retail numeric,
  jd_power_wholesale numeric,
  jd_power_retail numeric,
  auction_wholesale numeric,
  auction_retail numeric,
  book_values_condition text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT
        br.id as response_id,
        br.bid_request_id as request_id,
        v.year,
        v.make,
        v.model,
        v.trim as trim_level,
        v.vin,
        v.mileage,
        v.exterior as exterior_color,
        v.interior as interior_color,
        r.windshield,
        r.engine_light as engine_lights,
        r.brakes,
        r.tires as tire,
        r.maintenance,
        r.recon_estimate,
        r.recon_details,
        v.options as accessories,
        v.transmission,
        v.engine as engine_cylinders,
        v.drivetrain,
        u.full_name as user_full_name,
        d.dealer_name as dealership,
        u.mobile_number,
        br.offer_amount,
        br.status::text,
        -- Book values fields
        bv.mmr_wholesale,
        bv.mmr_retail,
        bv.kbb_wholesale,
        bv.kbb_retail,
        bv.jd_power_wholesale,
        bv.jd_power_retail,
        bv.auction_wholesale,
        bv.auction_retail,
        bv.condition as book_values_condition
    FROM bid_responses br
    JOIN bid_requests breq ON br.bid_request_id = breq.id
    JOIN vehicles v ON breq.vehicle_id = v.id
    JOIN reconditioning r ON breq.recon = r.id
    JOIN buybidhq_users u ON breq.user_id = u.id
    LEFT JOIN dealerships d ON u.dealership_id = d.id
    LEFT JOIN book_values bv ON v.id = bv.vehicle_id
    WHERE br.id = bid_response_id;
END;
$$;

COMMENT ON FUNCTION public.get_bid_response_details(uuid) IS
  'Returns complete bid response details including vehicle data, reconditioning, and book values for public bid response pages';
