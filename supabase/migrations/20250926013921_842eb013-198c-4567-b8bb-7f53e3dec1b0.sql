-- Complete the remaining function fixes for search path warnings
CREATE OR REPLACE FUNCTION public.get_bid_notification_details(p_bid_response_id uuid)
RETURNS TABLE(creator_phone text, buyer_name text, vehicle_year text, vehicle_make text, vehicle_model text, offer_amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.mobile_number as creator_phone,
    b.buyer_name,
    v.year as vehicle_year,
    v.make as vehicle_make,
    v.model as vehicle_model,
    br.offer_amount
  FROM bid_responses br
  JOIN bid_requests breq ON br.bid_request_id = breq.id
  JOIN buybidhq_users u ON breq.user_id = u.id
  JOIN buyers b ON br.buyer_id = b.id
  JOIN vehicles v ON breq.vehicle_id = v.id
  WHERE br.id = p_bid_response_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_mfa_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Insert only SMS MFA setting for new users (enabled if they have a validated phone)
    INSERT INTO mfa_settings (user_id, method, status)
    VALUES (
        NEW.id, 
        'sms', 
        CASE 
            WHEN NEW.mobile_number IS NOT NULL AND NEW.phone_validated = true 
            THEN 'enabled' 
            ELSE 'disabled' 
        END
    )
    ON CONFLICT (user_id, method) DO NOTHING;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_bid_submission_token(p_bid_request_id uuid, p_buyer_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_token TEXT;
BEGIN
    -- Generate a secure random token
    v_token := encode(gen_random_bytes(32), 'hex');
    
    -- Insert or update the token
    INSERT INTO bid_submission_tokens (bid_request_id, buyer_id, token, expires_at)
    VALUES (p_bid_request_id, p_buyer_id, v_token, now() + interval '7 days')
    ON CONFLICT (bid_request_id, buyer_id)
    DO UPDATE SET 
        token = v_token,
        is_used = false,
        expires_at = now() + interval '7 days',
        used_at = NULL;
    
    RETURN v_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_dealership(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT dealership_id FROM buybidhq_users WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role::text FROM buybidhq_users WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_user_with_dealership(user_id uuid)
RETURNS TABLE(id uuid, email text, role user_role, full_name text, mobile_number text, address text, city text, state text, zip_code text, dealership_id uuid, dealer_name text, business_phone text, business_email text, phone_carrier text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.role,
    u.full_name,
    u.mobile_number,
    u.address,
    u.city,
    u.state,
    u.zip_code,
    u.dealership_id,
    d.dealer_name,
    d.business_phone,
    d.business_email,
    u.phone_carrier
  FROM buybidhq_users u
  LEFT JOIN dealerships d ON u.dealership_id = d.id
  WHERE u.id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_sms_gateway_email(phone_number text, carrier text)
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
    standardized_number text;
    gateway_domain text;
BEGIN
    standardized_number := standardize_buyer_phone(phone_number);
    
    IF standardized_number IS NULL THEN
        RETURN NULL;
    END IF;
    
    gateway_domain := CASE carrier
        WHEN 'Verizon Wireless' THEN 'vtext.com'
        WHEN 'AT&T' THEN 'txt.att.net'
        WHEN 'T-Mobile' THEN 'tmomail.net'
        WHEN 'Sprint' THEN 'messaging.sprintpcs.com'
        WHEN 'US Cellular' THEN 'email.uscc.net'
        WHEN 'Metro PCS' THEN 'mymetropcs.com'
        WHEN 'Boost Mobile' THEN 'sms.myboostmobile.com'
        WHEN 'Cricket' THEN 'sms.cricketwireless.net'
        WHEN 'Virgin Mobile' THEN 'vmobl.com'
        ELSE NULL
    END;
    
    IF gateway_domain IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN standardized_number || '@' || gateway_domain;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid)
RETURNS user_profile_type
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    id,
    email,
    role,
    status,
    full_name,
    mobile_number,
    address,
    city,
    state,
    zip_code,
    company,
    dealership_id,
    is_active,
    created_at,
    updated_at,
    deleted_at
  FROM buybidhq_users
  WHERE id = user_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.standardize_carrier_name(carrier text)
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    RETURN CASE 
        WHEN carrier ILIKE '%verizon%' THEN 'Verizon Wireless'
        WHEN carrier ILIKE '%at&t%' OR carrier ILIKE '%att%' THEN 'AT&T'
        WHEN carrier ILIKE '%t-mobile%' OR carrier ILIKE '%tmobile%' THEN 'T-Mobile'
        WHEN carrier ILIKE '%sprint%' THEN 'Sprint'
        WHEN carrier ILIKE '%us cellular%' THEN 'US Cellular'
        WHEN carrier ILIKE '%metro%pcs%' THEN 'Metro PCS'
        WHEN carrier ILIKE '%boost%' THEN 'Boost Mobile'
        WHEN carrier ILIKE '%cricket%' THEN 'Cricket'
        WHEN carrier ILIKE '%virgin%' THEN 'Virgin Mobile'
        ELSE carrier
    END;
END;
$$;

CREATE OR REPLACE FUNCTION public.standardize_buyer_phone(phone_input text)
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
    cleaned text;
BEGIN
    -- Remove all non-digit characters
    cleaned := regexp_replace(phone_input, '\D', '', 'g');
    
    -- Handle different formats
    IF length(cleaned) = 10 THEN
        RETURN cleaned;
    ELSIF length(cleaned) = 11 AND left(cleaned, 1) = '1' THEN
        RETURN substring(cleaned from 2);
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.standardize_phone_number(phone_input text)
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
    cleaned text;
BEGIN
    -- Remove all non-digit characters
    cleaned := regexp_replace(phone_input, '\D', '', 'g');
    
    -- Handle different formats
    IF length(cleaned) = 10 THEN
        -- Add +1 for US numbers
        RETURN '+1' || cleaned;
    ELSIF length(cleaned) = 11 AND left(cleaned, 1) = '1' THEN
        -- Add + for numbers starting with 1
        RETURN '+' || cleaned;
    ELSIF length(cleaned) >= 11 AND left(cleaned, 2) = '11' THEN
        -- Remove extra 1 if number starts with 11
        RETURN '+' || substring(cleaned from 2);
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_phone_validation_batch()
RETURNS TABLE(total_processed integer, successful integer, failed integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    batch_identifier UUID;
    v_total_processed INTEGER := 0;
    v_successful INTEGER := 0;
    v_failed INTEGER := 0;
BEGIN
    -- Generate batch ID
    batch_identifier := gen_random_uuid();
    
    -- Insert records for all users with mobile numbers
    INSERT INTO phone_validation_batch_results 
        (user_id, original_number, batch_id)
    SELECT 
        id,
        mobile_number,
        batch_identifier
    FROM buybidhq_users
    WHERE mobile_number IS NOT NULL
    AND (phone_validated IS NULL OR NOT phone_validated);
    
    -- Get counts
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE is_valid),
        COUNT(*) FILTER (WHERE NOT is_valid)
    INTO 
        v_total_processed,
        v_successful,
        v_failed
    FROM phone_validation_batch_results
    WHERE batch_id = batch_identifier;
    
    RETURN QUERY SELECT v_total_processed, v_successful, v_failed;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If user doesn't exist in buybidhq_users, create them
  IF NOT EXISTS (SELECT 1 FROM buybidhq_users WHERE id = NEW.id) THEN
    INSERT INTO buybidhq_users (id, email, role, status)
    VALUES (NEW.id, NEW.email, 'basic', 'active');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_standardize_carrier()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    IF NEW.phone_carrier IS NOT NULL THEN
        NEW.phone_carrier := standardize_carrier_name(NEW.phone_carrier);
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_standardize_buyer_phone()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    -- Only process if buyer_mobile is provided
    IF NEW.buyer_mobile IS NOT NULL THEN
        NEW.standardized_phone := standardize_buyer_phone(NEW.buyer_mobile);
        
        -- Set validation status based on standardization result
        IF NEW.standardized_phone IS NOT NULL THEN
            NEW.phone_validation_status := 'valid';
        ELSE
            NEW.phone_validation_status := 'invalid';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_user_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Grant admin users access to all resources
    IF NEW.role = 'admin' THEN
        INSERT INTO user_permissions (user_id, resource_type, resource_id, permission)
        SELECT 
            NEW.id,
            'user',
            id,
            'admin'
        FROM buybidhq_users
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_dealership_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.last_updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_individual_dealer_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_subscription_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    -- Update status based on trial and billing dates
    IF NEW.trial_ends_at IS NOT NULL AND NEW.trial_ends_at > now() THEN
        NEW.status := 'trialing';
    ELSIF NEW.current_period_end < now() THEN
        NEW.status := 'past_due';
    ELSE
        NEW.status := 'active';
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_phone_with_twilio(phone_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- This function will be called by the Edge Function
    -- We're just setting up the database structure here
    RETURN '{}'::jsonb;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_role_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only cache if the user exists in buybidhq_users
    INSERT INTO user_role_cache (user_id, is_admin)
    VALUES (
        NEW.id,
        NEW.role = 'admin'
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        is_admin = (NEW.role = 'admin'),
        cached_at = now();
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_role_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only cache if the user exists in auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id) THEN
        INSERT INTO user_role_cache (user_id, is_admin)
        VALUES (
            NEW.id,
            NEW.role = 'admin'
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            is_admin = (NEW.role = 'admin'),
            cached_at = now();
    END IF;
    RETURN NEW;
END;
$$;