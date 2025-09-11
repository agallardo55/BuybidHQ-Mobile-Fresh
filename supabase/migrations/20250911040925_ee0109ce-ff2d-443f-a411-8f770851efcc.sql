-- Fix remaining search_path security warnings for all functions
-- This prevents potential schema manipulation attacks

-- Functions missing search_path
CREATE OR REPLACE FUNCTION public.batch_process_carrier_detection()
 RETURNS TABLE(total_processed integer, carriers_detected integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.check_user_role(user_id uuid, required_role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM buybidhq_users 
    WHERE id = user_id 
    AND role::text = required_role
  );
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_phone_numbers()
 RETURNS TABLE(total_processed integer, standardized integer, invalid integer, duplicates integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;