-- Fix the generate_bid_submission_token function to properly reference pgcrypto extension
CREATE OR REPLACE FUNCTION public.generate_bid_submission_token(p_bid_request_id uuid, p_buyer_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_token TEXT;
BEGIN
    -- Generate a secure random token using the extensions schema
    v_token := encode(extensions.gen_random_bytes(32), 'hex');
    
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
$function$;