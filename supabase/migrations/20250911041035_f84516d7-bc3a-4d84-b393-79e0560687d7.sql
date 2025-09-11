-- Continue fixing critical search_path warnings for remaining functions

CREATE OR REPLACE FUNCTION public.get_sms_gateway_email(phone_number text, carrier text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.standardize_carrier_name(carrier text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.standardize_buyer_phone(phone_input text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.standardize_phone_number(phone_input text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.trigger_standardize_carrier()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    IF NEW.phone_carrier IS NOT NULL THEN
        NEW.phone_carrier := standardize_carrier_name(NEW.phone_carrier);
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_standardize_buyer_phone()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;