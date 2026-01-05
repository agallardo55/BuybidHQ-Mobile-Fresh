-- Update create_complete_bid_request function to include new fields
-- This fixes the issue where bid requests fail because the RPC function doesn't include
-- newly added fields: body_style, history_report, history_service in vehicles table
-- and history, history_service in reconditioning table

CREATE OR REPLACE FUNCTION public.create_complete_bid_request(
  vehicle_data jsonb,
  recon_data jsonb,
  image_urls text[],
  buyer_ids uuid[],
  creator_id uuid,
  account_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  vehicle_id UUID;
  recon_id UUID;
  bid_request_id UUID;
BEGIN
  -- Create vehicle record with ALL fields including new ones
  INSERT INTO vehicles (
    year, make, model, trim, vin, mileage,
    engine, transmission, drivetrain,
    exterior, interior, options,
    body_style, history_report, history_service  -- NEW FIELDS
  ) VALUES (
    (vehicle_data->>'year')::text,
    (vehicle_data->>'make')::text,
    (vehicle_data->>'model')::text,
    (vehicle_data->>'trim')::text,
    (vehicle_data->>'vin')::text,
    (vehicle_data->>'mileage')::text,
    (vehicle_data->>'engine')::text,
    (vehicle_data->>'transmission')::text,
    (vehicle_data->>'drivetrain')::text,
    (vehicle_data->>'exterior')::text,
    (vehicle_data->>'interior')::text,
    (vehicle_data->>'options')::text,
    (vehicle_data->>'body_style')::text,          -- NEW
    (vehicle_data->>'history_report')::text,      -- NEW
    (vehicle_data->>'history_service')::text      -- NEW
  )
  RETURNING id INTO vehicle_id;

  -- Create reconditioning record with ALL fields including new ones
  INSERT INTO reconditioning (
    vehicle_id,
    windshield,
    engine_light,
    brakes,
    tires,
    maintenance,
    recon_estimate,
    recon_details,
    history,           -- NEW FIELD
    history_service    -- NEW FIELD
  ) VALUES (
    vehicle_id,
    (recon_data->>'windshield')::text,
    (recon_data->>'engine_light')::text,
    (recon_data->>'brakes')::text,
    (recon_data->>'tires')::text,
    (recon_data->>'maintenance')::text,
    (recon_data->>'recon_estimate')::text,
    (recon_data->>'recon_details')::text,
    (recon_data->>'history')::text,                -- NEW
    (recon_data->>'history_service')::text         -- NEW
  )
  RETURNING id INTO recon_id;

  -- Create bid request record with account_id
  INSERT INTO bid_requests (
    user_id,
    vehicle_id,
    recon,
    status,
    account_id
  ) VALUES (
    creator_id,
    vehicle_id,
    recon_id,
    'Pending',
    account_id
  )
  RETURNING id INTO bid_request_id;

  -- Insert images
  IF array_length(image_urls, 1) > 0 THEN
    INSERT INTO images (bid_request_id, image_url)
    SELECT bid_request_id, url
    FROM unnest(image_urls) AS url;
  END IF;

  RETURN bid_request_id;
END;
$function$;

COMMENT ON FUNCTION public.create_complete_bid_request IS
  'Creates a complete bid request with vehicle, reconditioning, images and returns the bid_request_id. Updated to include body_style, history_report, history_service fields.';
