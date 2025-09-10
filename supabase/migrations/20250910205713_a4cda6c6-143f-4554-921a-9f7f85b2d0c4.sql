-- CRITICAL SECURITY FIX: Secure bid submission tokens and create public access RPC

-- 1. Drop the insecure policy that allows public access to bid_submission_tokens
DROP POLICY IF EXISTS "System can manage bid submission tokens" ON public.bid_submission_tokens;

-- 2. Create secure policies for bid submission tokens

-- Only system/edge functions can create tokens (for sending bid invitations)
CREATE POLICY "Edge functions can create bid tokens" 
ON public.bid_submission_tokens 
FOR INSERT 
WITH CHECK (
  -- Only allow creation if the user owns the bid request
  EXISTS (
    SELECT 1 FROM public.bid_requests br 
    WHERE br.id = bid_submission_tokens.bid_request_id 
    AND br.user_id = auth.uid()
  )
  OR 
  -- Or if it's called from an edge function (service role)
  auth.jwt() ->> 'role' = 'service_role'
);

-- Only system can validate tokens (for bid submission)
CREATE POLICY "System can validate bid tokens" 
ON public.bid_submission_tokens 
FOR SELECT 
USING (
  -- Allow system/edge functions to validate tokens
  auth.jwt() ->> 'role' = 'service_role'
  OR
  -- Allow users to see tokens for their own bid requests only
  EXISTS (
    SELECT 1 FROM public.bid_requests br 
    WHERE br.id = bid_submission_tokens.bid_request_id 
    AND br.user_id = auth.uid()
  )
);

-- Only system can update token status (mark as used)
CREATE POLICY "System can update bid tokens" 
ON public.bid_submission_tokens 
FOR UPDATE 
USING (
  -- Only edge functions can update token status
  auth.jwt() ->> 'role' = 'service_role'
  OR
  -- Bid request owners can update their tokens
  EXISTS (
    SELECT 1 FROM public.bid_requests br 
    WHERE br.id = bid_submission_tokens.bid_request_id 
    AND br.user_id = auth.uid()
  )
);

-- Only admins can delete tokens (cleanup)
CREATE POLICY "Admins can delete bid tokens" 
ON public.bid_submission_tokens 
FOR DELETE 
USING (
  is_admin(auth.uid())
  OR
  -- Bid request owners can delete their tokens
  EXISTS (
    SELECT 1 FROM public.bid_requests br 
    WHERE br.id = bid_submission_tokens.bid_request_id 
    AND br.user_id = auth.uid()
  )
);

-- 3. Create a secure RPC for public access to bid request details
CREATE OR REPLACE FUNCTION public.get_public_bid_request_details(p_token text)
RETURNS TABLE(
  request_id uuid,
  created_at timestamp with time zone,
  status text,
  notes text,
  vehicle_year text,
  vehicle_make text,
  vehicle_model text,
  vehicle_trim text,
  vehicle_vin text,
  vehicle_mileage text,
  vehicle_engine text,
  vehicle_transmission text,
  vehicle_drivetrain text,
  buyer_name text,
  buyer_dealership text,
  buyer_mobile text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_token_valid boolean := false;
  v_bid_request_id uuid;
  v_buyer_id uuid;
BEGIN
  -- First validate the token
  SELECT 
    (NOT t.is_used AND t.expires_at > now()) as is_valid,
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

  -- Return sanitized bid request details for this specific token
  RETURN QUERY
  SELECT 
    br.id as request_id,
    br.created_at,
    br.status::text,
    COALESCE(bst.notes, '') as notes,
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
  LEFT JOIN bid_submission_tokens bst ON bst.bid_request_id = br.id AND bst.buyer_id = v_buyer_id
  WHERE br.id = v_bid_request_id;
END;
$function$;