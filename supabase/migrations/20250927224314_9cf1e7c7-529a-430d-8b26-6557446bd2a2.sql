-- Drop and recreate get_public_bid_request_details function without notes field
-- The notes field was referencing a non-existent column bst.notes
DROP FUNCTION IF EXISTS public.get_public_bid_request_details(text);

CREATE OR REPLACE FUNCTION public.get_public_bid_request_details(p_token text)
 RETURNS TABLE(request_id uuid, created_at timestamp with time zone, status text, vehicle_year text, vehicle_make text, vehicle_model text, vehicle_trim text, vehicle_vin text, vehicle_mileage text, vehicle_engine text, vehicle_transmission text, vehicle_drivetrain text, buyer_name text, buyer_dealership text, buyer_mobile text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_token_valid boolean := false;
  v_bid_request_id uuid;
  v_buyer_id uuid;
BEGIN
  -- Validate the token (removed expiration check)
  SELECT 
    (NOT t.is_used) as is_valid,
    t.bid_request_id,
    t.buyer_id
  INTO v_token_valid, v_bid_request_id, v_buyer_id
  FROM bid_submission_tokens t
  WHERE t.token = p_token
  LIMIT 1;

  -- If token is invalid, return empty result
  IF NOT v_token_valid OR v_bid_request_id IS NULL THEN
    RETURN;
  END IF;

  -- Additional security check: verify the bid request exists
  -- Removed status check - bid response pages should always be accessible with valid tokens
  IF NOT EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.id = v_bid_request_id
  ) THEN
    RETURN;
  END IF;

  -- Return sanitized bid request details for this specific token
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
    COALESCE(u.full_name, 'N/A') as buyer_name,
    CASE 
      WHEN d.dealer_name IS NOT NULL THEN d.dealer_name
      ELSE 'Direct Buyer'
    END as buyer_dealership,
    COALESCE(u.mobile_number, 'N/A') as buyer_mobile
  FROM bid_requests br
  JOIN vehicles v ON br.vehicle_id = v.id
  JOIN buybidhq_users u ON br.user_id = u.id
  LEFT JOIN dealerships d ON u.dealership_id = d.id
  WHERE br.id = v_bid_request_id;
END;
$function$