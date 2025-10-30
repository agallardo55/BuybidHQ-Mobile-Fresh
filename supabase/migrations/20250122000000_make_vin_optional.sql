-- =====================================================
-- Make VIN Optional for Manual Vehicle Entry
-- =====================================================

-- Ensure VIN column is nullable (it should already be, but let's be explicit)
ALTER TABLE public.vehicles 
ALTER COLUMN vin DROP NOT NULL;

-- Add comment explaining VIN is optional
COMMENT ON COLUMN public.vehicles.vin IS 'Optional - can be null for manual entries without VIN';

-- Update the create_complete_bid_request function to handle null VINs
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
  -- Create vehicle record (VIN can be null)
  INSERT INTO vehicles (
    year, make, model, trim, vin, mileage,
    engine, transmission, drivetrain,
    exterior, interior, options
  ) VALUES (
    (vehicle_data->>'year')::text,
    (vehicle_data->>'make')::text,
    (vehicle_data->>'model')::text,
    (vehicle_data->>'trim')::text,
    NULLIF(vehicle_data->>'vin', '')::text, -- Convert empty string to NULL
    (vehicle_data->>'mileage')::text,
    (vehicle_data->>'engine')::text,
    (vehicle_data->>'transmission')::text,
    (vehicle_data->>'drivetrain')::text,
    (vehicle_data->>'exterior')::text,
    (vehicle_data->>'interior')::text,
    (vehicle_data->>'options')::text
  )
  RETURNING id INTO vehicle_id;

  -- Create reconditioning record
  INSERT INTO reconditioning (
    vehicle_id,
    windshield,
    engine_light,
    brakes,
    tires,
    maintenance,
    recon_estimate,
    recon_details
  ) VALUES (
    vehicle_id,
    (recon_data->>'windshield')::text,
    (recon_data->>'engine_light')::text,
    (recon_data->>'brakes')::text,
    (recon_data->>'tires')::text,
    (recon_data->>'maintenance')::text,
    (recon_data->>'recon_estimate')::text,
    (recon_data->>'recon_details')::text
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
    INSERT INTO vehicle_images (vehicle_id, image_url, created_at)
    SELECT vehicle_id, unnest(image_urls), NOW();
  END IF;

  -- Insert buyer associations
  IF array_length(buyer_ids, 1) > 0 THEN
    INSERT INTO bid_request_buyers (bid_request_id, buyer_id, created_at)
    SELECT bid_request_id, unnest(buyer_ids), NOW();
  END IF;

  RETURN bid_request_id;
END;
$function$;

COMMENT ON FUNCTION public.create_complete_bid_request IS 'Creates a complete bid request with optional VIN. VIN can be null for manual entries.';
