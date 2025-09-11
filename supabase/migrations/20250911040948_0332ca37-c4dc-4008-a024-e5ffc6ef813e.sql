-- Fix remaining search_path security warnings - Part 1
-- Drop and recreate functions that need signature changes

DROP FUNCTION IF EXISTS public.batch_process_carrier_detection();
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
    FOR v_carrier_info IN
        SELECT id, mobile_number
        FROM buybidhq_users
        WHERE phone_validated = true
        AND (phone_carrier IS NULL OR phone_type IS NULL)
        AND mobile_number IS NOT NULL
        AND deleted_at IS NULL
    LOOP
        v_total := v_total + 1;
        PERFORM get_carrier_for_validated_number(v_carrier_info.id, v_carrier_info.mobile_number);
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

-- Update other functions with search_path
CREATE OR REPLACE FUNCTION public.generate_verification_code()
 RETURNS character varying
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;