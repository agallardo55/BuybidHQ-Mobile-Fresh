-- Add RLS policies to allow public access for bid response functionality

-- Allow public access to bid_requests through the secure function
CREATE POLICY "Public access via secure token function" ON public.bid_requests
FOR SELECT
TO anon
USING (
  -- This policy allows access when called from the get_public_bid_request_details function
  EXISTS (
    SELECT 1 FROM bid_submission_tokens 
    WHERE bid_submission_tokens.bid_request_id = bid_requests.id
    AND NOT bid_submission_tokens.is_used 
    AND bid_submission_tokens.expires_at > now()
  )
);

-- Allow public access to bid_submission_tokens for validation
CREATE POLICY "Public token validation" ON public.bid_submission_tokens
FOR SELECT
TO anon
USING (
  -- Allow reading tokens that are not used and not expired
  NOT is_used AND expires_at > now()
);

-- Allow public bid response submissions
CREATE POLICY "Public bid submission" ON public.bid_responses
FOR INSERT
TO anon
WITH CHECK (
  -- Allow inserting bid responses if there's a valid token for this request and buyer
  EXISTS (
    SELECT 1 FROM bid_submission_tokens bst
    WHERE bst.bid_request_id = bid_responses.bid_request_id
    AND bst.buyer_id = bid_responses.buyer_id
    AND NOT bst.is_used 
    AND bst.expires_at > now()
  )
);

-- Allow public access to vehicles data for bid responses
CREATE POLICY "Public vehicle access for bid responses" ON public.vehicles
FOR SELECT
TO anon
USING (
  -- Allow access to vehicle data if there's an active bid request with valid tokens
  EXISTS (
    SELECT 1 FROM bid_requests br
    JOIN bid_submission_tokens bst ON bst.bid_request_id = br.id
    WHERE br.vehicle_id = vehicles.id
    AND NOT bst.is_used 
    AND bst.expires_at > now()
  )
);

-- Allow public access to reconditioning data for bid responses
CREATE POLICY "Public reconditioning access for bid responses" ON public.reconditioning
FOR SELECT
TO anon
USING (
  -- Allow access to reconditioning data if there's an active bid request with valid tokens
  EXISTS (
    SELECT 1 FROM bid_requests br
    JOIN bid_submission_tokens bst ON bst.bid_request_id = br.id
    WHERE br.recon = reconditioning.id
    AND NOT bst.is_used 
    AND bst.expires_at > now()
  )
);

-- Allow public access to buyers data for bid responses
CREATE POLICY "Public buyer access for bid responses" ON public.buyers
FOR SELECT
TO anon
USING (
  -- Allow access to buyer data if there's an active token for this buyer
  EXISTS (
    SELECT 1 FROM bid_submission_tokens bst
    WHERE bst.buyer_id = buyers.id
    AND NOT bst.is_used 
    AND bst.expires_at > now()
  )
);