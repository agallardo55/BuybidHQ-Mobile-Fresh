-- Remove the 10 bid request monthly limit for free plan users
-- All plans now have unlimited bid requests

CREATE OR REPLACE FUNCTION public.can_create_bid_request(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = 'public'
AS $$
BEGIN
  -- All plans now have unlimited bid requests
  RETURN jsonb_build_object('allowed', true);
END;
$$;