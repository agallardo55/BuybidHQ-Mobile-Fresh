-- Final migration to fix all remaining function search path warnings
CREATE OR REPLACE FUNCTION public.can_manage_user(manager_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Admin can manage all non-deleted users
  IF EXISTS (
    SELECT 1 FROM buybidhq_users
    WHERE id = manager_id 
    AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;

  -- Account admin can manage all users in their dealership
  IF EXISTS (
    SELECT 1 
    FROM buybidhq_users manager
    JOIN buybidhq_users target ON target.dealership_id = manager.dealership_id
    WHERE manager.id = manager_id 
    AND manager.app_role = 'account_admin'
    AND target.id = target_user_id
    AND target.role IN ('basic', 'individual', 'salesperson', 'associate')
    AND target.deleted_at IS NULL
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_access_bid_request(checking_user_id uuid, request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Check if user is admin
    IF EXISTS (
        SELECT 1 FROM user_role_cache 
        WHERE user_id = checking_user_id 
        AND is_admin = true
    ) THEN
        RETURN true;
    END IF;

    -- Check if user owns the bid request
    IF EXISTS (
        SELECT 1 FROM bid_requests 
        WHERE id = request_id 
        AND user_id = checking_user_id
    ) THEN
        RETURN true;
    END IF;

    -- Check cached access
    RETURN EXISTS (
        SELECT 1 
        FROM bid_request_access 
        WHERE user_id = checking_user_id 
        AND bid_request_id = request_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_deletion(user_id uuid, deleted_by_id uuid, deletion_reason text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert into deleted_users
  INSERT INTO deleted_users (
    id,
    original_created_at,
    deleted_by,
    email,
    full_name,
    role,
    mobile_number,
    address,
    city,
    state,
    zip_code,
    dealership_id,
    status,
    deletion_reason
  )
  SELECT
    id,
    created_at,
    deleted_by_id,
    email,
    full_name,
    role,
    mobile_number,
    address,
    city,
    state,
    zip_code,
    dealership_id,
    status,
    deletion_reason
  FROM buybidhq_users
  WHERE id = user_id;

  -- Update the user record
  UPDATE buybidhq_users
  SET
    deleted_at = NOW(),
    is_active = false,
    status = 'deleted'
  WHERE id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.maintain_buyers_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Insert access for the buyer owner
    INSERT INTO buyers_access_cache (user_id, buyer_id, access_level)
    VALUES (NEW.user_id, NEW.id, 'owner')
    ON CONFLICT (user_id, buyer_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_notifications_as_read(notification_ids uuid[])
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  UPDATE notifications
  SET read_at = NOW()
  WHERE id = ANY(notification_ids)
    AND user_id = auth.uid()
    AND read_at IS NULL
  RETURNING id;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_phone_numbers()
RETURNS TABLE(total_processed integer, standardized integer, invalid integer, duplicates integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_total integer := 0;
    v_standardized integer := 0;
    v_invalid integer := 0;
    v_duplicates integer := 0;
    v_temp_number text;
BEGIN
    -- Create temporary table for processing
    CREATE TEMP TABLE temp_numbers AS
    SELECT 
        id,
        mobile_number,
        standardize_phone_number(mobile_number) as formatted_number
    FROM buybidhq_users
    WHERE 
        mobile_number IS NOT NULL 
        AND deleted_at IS NULL
        AND is_active = true;

    -- Count total numbers
    SELECT COUNT(*) INTO v_total FROM temp_numbers;

    -- Mark duplicates for users that aren't deleted
    WITH duplicates AS (
        SELECT formatted_number
        FROM temp_numbers
        WHERE formatted_number IS NOT NULL
        GROUP BY formatted_number
        HAVING COUNT(*) > 1
    )
    UPDATE buybidhq_users u
    SET 
        mobile_number = NULL,
        phone_validated = false,
        phone_carrier = NULL,
        updated_at = NOW()
    FROM duplicates d
    WHERE 
        standardize_phone_number(u.mobile_number) = d.formatted_number
        AND u.id NOT IN (
            SELECT DISTINCT ON (formatted_number) id
            FROM temp_numbers
            WHERE formatted_number IN (SELECT formatted_number FROM duplicates)
            ORDER BY formatted_number, id
        );

    -- Count duplicates removed
    GET DIAGNOSTICS v_duplicates = ROW_COUNT;

    -- Update valid numbers to standardized format
    UPDATE buybidhq_users u
    SET 
        mobile_number = t.formatted_number,
        updated_at = NOW()
    FROM temp_numbers t
    WHERE 
        u.id = t.id 
        AND t.formatted_number IS NOT NULL
        AND t.formatted_number NOT LIKE '+1555%'; -- Exclude test numbers

    -- Count standardized
    GET DIAGNOSTICS v_standardized = ROW_COUNT;

    -- Remove test numbers (555)
    UPDATE buybidhq_users
    SET 
        mobile_number = NULL,
        phone_validated = false,
        phone_carrier = NULL,
        updated_at = NOW()
    WHERE 
        mobile_number LIKE '%555%'
        AND deleted_at IS NULL;

    -- Count invalid (including test numbers)
    SELECT COUNT(*) INTO v_invalid
    FROM temp_numbers
    WHERE formatted_number IS NULL OR formatted_number LIKE '+1555%';

    -- Drop temporary table
    DROP TABLE temp_numbers;

    -- Return statistics
    RETURN QUERY SELECT v_total, v_standardized, v_invalid, v_duplicates;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_bid_response_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  bid_request_info RECORD;
  buyer_info RECORD;
  notification_content JSONB;
BEGIN
  -- Get bid request and vehicle information
  SELECT 
    br.id as request_id,
    br.user_id as creator_id,
    v.year,
    v.make,
    v.model
  INTO bid_request_info
  FROM bid_requests br
  JOIN vehicles v ON br.vehicle_id = v.id
  WHERE br.id = NEW.bid_request_id;

  -- Get buyer information
  SELECT 
    buyer_name,
    dealer_name,
    email
  INTO buyer_info
  FROM buyers
  WHERE id = NEW.buyer_id;

  -- Build notification content based on whether it's from a dealer or direct buyer
  notification_content := jsonb_build_object(
    'bid_request_id', bid_request_info.request_id,
    'vehicle', jsonb_build_object(
      'year', bid_request_info.year,
      'make', bid_request_info.make,
      'model', bid_request_info.model
    ),
    'buyer', jsonb_build_object(
      'name', COALESCE(buyer_info.buyer_name, 'Anonymous Buyer'),
      'dealer', CASE 
        WHEN buyer_info.dealer_name = 'BuybidHQ Dealer' THEN 'Direct Buyer'
        ELSE buyer_info.dealer_name
      END
    ),
    'offer_amount', NEW.offer_amount
  );

  -- Insert notification for bid request creator
  INSERT INTO notifications (
    user_id,
    type,
    content,
    reference_id
  )
  VALUES (
    bid_request_info.creator_id,
    'bid_response',
    notification_content,
    NEW.id
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_complete_bid_request(vehicle_data jsonb, recon_data jsonb, image_urls text[], buyer_ids uuid[], creator_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  vehicle_id UUID;
  recon_id UUID;
  bid_request_id UUID;
BEGIN
  -- Create vehicle record
  INSERT INTO vehicles (
    year, make, model, trim, vin, mileage,
    engine, transmission, drivetrain,
    exterior, interior, options
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

  -- Create bid request record
  INSERT INTO bid_requests (
    user_id,
    vehicle_id,
    recon,
    status
  ) VALUES (
    creator_id,
    vehicle_id,
    recon_id,
    'Pending'
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
$$;

CREATE OR REPLACE FUNCTION public.get_carrier_for_validated_number(p_user_id uuid, p_phone_number text)
RETURNS TABLE(carrier text, number_type phone_number_type, area_code text, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only process if number is already validated
    IF EXISTS (
        SELECT 1 
        FROM buybidhq_users 
        WHERE id = p_user_id 
        AND phone_validated = true 
        AND mobile_number = p_phone_number
    ) THEN
        -- Extract area code (assumes US number)
        area_code := CASE 
            WHEN p_phone_number ~ '^\+1([0-9]{3})' 
            THEN substring(p_phone_number from '^\+1([0-9]{3})' for '#')
            ELSE NULL
        END;
        
        -- Basic carrier determination (mock for now, will be replaced with Twilio)
        -- This helps maintain consistent carrier assignment per area code
        carrier := CASE (ascii(area_code) % 7)
            WHEN 0 THEN 'Verizon Wireless'
            WHEN 1 THEN 'AT&T'
            WHEN 2 THEN 'T-Mobile'
            WHEN 3 THEN 'Sprint'
            WHEN 4 THEN 'US Cellular'
            WHEN 5 THEN 'Metro PCS'
            ELSE 'Other Carrier'
        END;
        
        -- Update user's carrier information
        UPDATE buybidhq_users 
        SET 
            phone_carrier = carrier,
            phone_type = 'mobile'::phone_number_type
        WHERE id = p_user_id;
        
        -- Return carrier information
        RETURN QUERY
        SELECT 
            carrier,
            'mobile'::phone_number_type as number_type,
            area_code,
            true as is_valid;
    ELSE
        -- Return null values if number isn't validated
        RETURN QUERY
        SELECT 
            NULL::text as carrier,
            'unknown'::phone_number_type as number_type,
            NULL::text as area_code,
            false as is_valid;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_bid_request_details(p_request_id uuid)
RETURNS TABLE(request_id uuid, created_at timestamp with time zone, status text, year text, make text, model text, trim_level text, vin text, mileage text, user_full_name text, engine_cylinders text, transmission text, drivetrain text, exterior_color text, interior_color text, accessories text, windshield text, engine_lights text, brakes text, tire text, maintenance text, recon_estimate text, recon_details text)
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
    r.recon_details
  FROM bid_requests br
  JOIN vehicles v ON br.vehicle_id = v.id
  JOIN reconditioning r ON br.recon = r.id
  JOIN buybidhq_users u ON br.user_id = u.id
  WHERE br.id = p_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_bid_response_details(bid_response_id uuid)
RETURNS TABLE(response_id uuid, request_id uuid, year text, make text, model text, trim_level text, vin text, mileage text, exterior_color text, interior_color text, windshield text, engine_lights text, brakes text, tire text, maintenance text, recon_estimate text, recon_details text, accessories text, transmission text, engine_cylinders text, drivetrain text, user_full_name text, dealership text, mobile_number text, offer_amount numeric, status text)
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
        r.recon_est as recon_estimate,
        r.recod_details as recon_details,
        v.options as accessories,
        v.transmission,
        v.engine as engine_cylinders,
        v.drivetrain,
        u.full_name as user_full_name,
        d.dealer_name as dealership,
        u.mobile_number,
        br.offer_amount,
        br.status
    FROM bid_responses br
    JOIN bid_requests breq ON br.bid_request_id = breq.id
    JOIN vehicles v ON breq.vehicle_id = v.id
    JOIN reconditioning r ON breq.recon = r.id
    JOIN buybidhq_users u ON breq.user_id = u.id
    LEFT JOIN dealerships d ON u.dealership_id = d.id
    WHERE br.id = $1;
END;
$$;

CREATE OR REPLACE FUNCTION public.migrate_individual_dealers()
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    -- Insert records into individual_dealers for existing individual users
    INSERT INTO individual_dealers (
        user_id,
        business_name,
        business_phone,
        business_email,
        license_number,
        address,
        city,
        state,
        zip_code
    )
    SELECT 
        u.id as user_id,
        d.dealer_name as business_name,
        d.business_phone,
        d.business_email,
        d.dealer_id as license_number,
        d.address,
        d.city,
        d.state,
        d.zip_code
    FROM buybidhq_users u
    JOIN dealerships d ON u.dealership_id = d.id
    WHERE u.role = 'individual'
    AND NOT EXISTS (
        SELECT 1 FROM individual_dealers WHERE user_id = u.id
    );

    -- Update dealership types
    UPDATE dealerships
    SET dealer_type = 'individual'
    WHERE id IN (
        SELECT dealership_id 
        FROM buybidhq_users 
        WHERE role = 'individual'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.process_carrier_detection_batch()
RETURNS TABLE(total_processed integer, carriers_detected integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_total INTEGER := 0;
    v_detected INTEGER := 0;
    v_carrier_info RECORD;
BEGIN
    -- Process all validated numbers without carrier info
    FOR v_carrier_info IN
        SELECT id, mobile_number
        FROM buybidhq_users
        WHERE phone_validated = true
        AND (phone_carrier IS NULL OR phone_type IS NULL)
        AND mobile_number IS NOT NULL
        AND deleted_at IS NULL
    LOOP
        v_total := v_total + 1;
        
        -- Get carrier information
        PERFORM get_carrier_for_validated_number(v_carrier_info.id, v_carrier_info.mobile_number);
        
        -- Count successful detections
        IF EXISTS (
            SELECT 1 
            FROM buybidhq_users 
            WHERE id = v_carrier_info.id 
            AND phone_carrier IS NOT NULL
        ) THEN
            v_detected := v_detected + 1;
        END IF;
    END LOOP;
    
    RETURN QUERY SELECT v_total, v_detected;
END;
$$;

CREATE OR REPLACE FUNCTION public.transfer_primary_dealer(current_primary_id uuid, new_primary_id uuid, target_dealership_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_dealership_exists BOOLEAN;
  v_is_current_primary BOOLEAN;
  v_new_user_is_dealer BOOLEAN;
BEGIN
  -- Check if dealership exists and current user is primary
  SELECT EXISTS (
    SELECT 1 
    FROM dealerships 
    WHERE id = target_dealership_id 
    AND primary_user_id = current_primary_id
  ) INTO v_is_current_primary;

  IF NOT v_is_current_primary THEN
    RAISE EXCEPTION 'Unauthorized: Only the current primary dealer can transfer primary status';
  END IF;

  -- Check if new user has dealer role
  SELECT EXISTS (
    SELECT 1 
    FROM buybidhq_users 
    WHERE id = new_primary_id 
    AND role = 'dealer'
  ) INTO v_new_user_is_dealer;

  IF NOT v_new_user_is_dealer THEN
    RAISE EXCEPTION 'Invalid user role: New primary user must have dealer role';
  END IF;

  -- Update primary dealer
  UPDATE dealerships
  SET 
    primary_user_id = new_primary_id,
    primary_assigned_at = NOW()
  WHERE id = target_dealership_id
  AND primary_user_id = current_primary_id;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_bid_submission_token(p_token text)
RETURNS TABLE(is_valid boolean, bid_request_id uuid, buyer_id uuid, existing_bid_amount numeric, has_existing_bid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    WITH token_info AS (
        SELECT 
            (NOT t.is_used AND t.expires_at > now()) as is_valid,
            t.bid_request_id,
            t.buyer_id,
            br.offer_amount as existing_bid_amount,
            CASE WHEN br.id IS NOT NULL THEN true ELSE false END as has_existing_bid
        FROM bid_submission_tokens t
        -- Only check for bids from the same buyer
        LEFT JOIN bid_responses br ON 
            br.bid_request_id = t.bid_request_id 
            AND br.buyer_id = t.buyer_id
        WHERE t.token = p_token
        LIMIT 1
    )
    SELECT 
        ti.is_valid,
        ti.bid_request_id,
        ti.buyer_id,
        ti.existing_bid_amount,
        ti.has_existing_bid
    FROM token_info ti;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_mfa_code(p_user_id uuid, p_verification_code character varying)
RETURNS TABLE(is_valid boolean, attempts_remaining integer, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_verification_record mfa_verifications;
    v_max_attempts CONSTANT INTEGER := 3;
BEGIN
    -- Get the latest unexpired verification record for the user
    SELECT *
    INTO v_verification_record
    FROM mfa_verifications
    WHERE user_id = p_user_id
    AND verified_at IS NULL
    AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If no valid verification record exists
    IF v_verification_record IS NULL THEN
        RETURN QUERY SELECT false, 0, 'No valid verification code found'::TEXT;
        RETURN;
    END IF;
    
    -- Update attempts counter
    UPDATE mfa_verifications
    SET attempts = attempts + 1
    WHERE id = v_verification_record.id;
    
    -- Check attempts limit
    IF v_verification_record.attempts >= v_max_attempts THEN
        RETURN QUERY SELECT false, 0, 'Maximum attempts exceeded'::TEXT;
        RETURN;
    END IF;
    
    -- Verify code
    IF v_verification_record.verification_code = p_verification_code THEN
        -- Mark as verified
        UPDATE mfa_verifications
        SET verified_at = now()
        WHERE id = v_verification_record.id;
        
        RETURN QUERY SELECT true, (v_max_attempts - v_verification_record.attempts - 1), 'Code verified successfully'::TEXT;
    ELSE
        RETURN QUERY SELECT false, (v_max_attempts - v_verification_record.attempts - 1), 'Invalid verification code'::TEXT;
    END IF;
END;
$$;