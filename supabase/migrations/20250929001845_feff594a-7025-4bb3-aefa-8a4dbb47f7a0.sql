-- Drop and recreate the function to include book values and condition data
DROP FUNCTION IF EXISTS public.get_public_bid_request_details(text);

CREATE OR REPLACE FUNCTION public.get_public_bid_request_details(p_token text)
 RETURNS TABLE(
   request_id uuid, created_at timestamp with time zone, status text, 
   vehicle_year text, vehicle_make text, vehicle_model text, vehicle_trim text, 
   vehicle_vin text, vehicle_mileage text, vehicle_engine text, 
   vehicle_transmission text, vehicle_drivetrain text, 
   vehicle_exterior_color text, vehicle_interior_color text, vehicle_accessories text, 
   buyer_name text, buyer_dealership text, buyer_mobile text, 
   is_used boolean, submitted_offer_amount numeric, submitted_at timestamp with time zone, 
   vehicle_images json, 
   kbb_wholesale numeric, kbb_retail numeric, jd_power_wholesale numeric, jd_power_retail numeric, 
   mmr_wholesale numeric, mmr_retail numeric, auction_wholesale numeric, auction_retail numeric,
   windshield text, engine_lights text, brakes text, tire text, 
   maintenance text, recon_estimate text, recon_details text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_token_valid boolean := false;
  v_bid_request_id uuid;
  v_buyer_id uuid;
BEGIN
  -- Validate the token
  SELECT 
    (NOT t.is_used) as is_valid,
    t.bid_request_id,
    t.buyer_id,
    t.is_used
  INTO v_token_valid, v_bid_request_id, v_buyer_id
  FROM bid_submission_tokens t
  WHERE t.token = p_token
  LIMIT 1;

  -- If token doesn't exist, return empty result
  IF v_bid_request_id IS NULL THEN
    RETURN;
  END IF;

  -- Additional security check: verify the bid request exists
  IF NOT EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.id = v_bid_request_id
  ) THEN
    RETURN;
  END IF;

  -- Return bid request details including book values and condition data
  RETURN QUERY
  SELECT 
    br.id as request_id,
    br.created_at,
    br.status::text,
    COALESCE(v.year, 'N/A') as vehicle_year,
    COALESCE(v.make, 'N/A') as vehicle_make,
    COALESCE(v.model, 'N/A') as vehicle_model,
    COALESCE(v.trim, 'N/A') as vehicle_trim,
    COALESCE(v.vin, 'N/A') as vehicle_vin,
    COALESCE(v.mileage, 'N/A') as vehicle_mileage,
    COALESCE(v.engine, 'N/A') as vehicle_engine,
    COALESCE(v.transmission, 'N/A') as vehicle_transmission,
    COALESCE(v.drivetrain, 'N/A') as vehicle_drivetrain,
    COALESCE(NULLIF(v.exterior, ''), 'N/A') as vehicle_exterior_color,
    COALESCE(NULLIF(v.interior, ''), 'N/A') as vehicle_interior_color,
    COALESCE(NULLIF(v.options, ''), 'None') as vehicle_accessories,
    COALESCE(u.full_name, 'N/A') as buyer_name,
    CASE 
      WHEN id.business_name IS NOT NULL THEN id.business_name
      WHEN d.dealer_name IS NOT NULL THEN d.dealer_name
      ELSE 'Direct Buyer'
    END as buyer_dealership,
    COALESCE(u.mobile_number, 'N/A') as buyer_mobile,
    bst.is_used,
    bres.offer_amount as submitted_offer_amount,
    bres.created_at as submitted_at,
    COALESCE(
      (SELECT json_agg(i.image_url ORDER BY i.sequence_order, i.created_at)
       FROM images i 
       WHERE i.bid_request_id = br.id), 
      '[]'::json
    ) as vehicle_images,
    bv.kbb_wholesale,
    bv.kbb_retail,
    bv.jd_power_wholesale,
    bv.jd_power_retail,
    bv.mmr_wholesale,
    bv.mmr_retail,
    bv.auction_wholesale,
    bv.auction_retail,
    COALESCE(r.windshield, 'N/A') as windshield,
    COALESCE(r.engine_light, 'N/A') as engine_lights,
    COALESCE(r.brakes, 'N/A') as brakes,
    COALESCE(r.tires, 'N/A') as tire,
    COALESCE(r.maintenance, 'N/A') as maintenance,
    COALESCE(r.recon_estimate, '0') as recon_estimate,
    COALESCE(r.recon_details, 'N/A') as recon_details
  FROM bid_requests br
  JOIN vehicles v ON br.vehicle_id = v.id
  LEFT JOIN reconditioning r ON br.recon = r.id
  JOIN buybidhq_users u ON br.user_id = u.id
  LEFT JOIN individual_dealers id ON u.id = id.user_id
  LEFT JOIN dealerships d ON u.dealership_id = d.id
  LEFT JOIN "bookValues" bv ON bv.vehicle_id = v.id
  JOIN bid_submission_tokens bst ON bst.bid_request_id = br.id AND bst.token = p_token
  LEFT JOIN bid_responses bres ON bres.bid_request_id = br.id AND bres.buyer_id = bst.buyer_id
  WHERE br.id = v_bid_request_id;
END;
$function$