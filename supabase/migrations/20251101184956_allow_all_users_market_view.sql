-- Allow all authenticated users to view all bid requests for Market View
-- This policy enables the global market view functionality where all users
-- can see bid requests from all accounts

CREATE POLICY "All authenticated users can view bid requests for market view" 
ON public.bid_requests 
FOR SELECT 
TO authenticated 
USING (true);

COMMENT ON POLICY "All authenticated users can view bid requests for market view" ON public.bid_requests IS 
'Allows all authenticated users to view all bid requests across all accounts for the Market View page. INSERT/UPDATE/DELETE operations remain restricted by account-scoped policies.';

-- Allow all authenticated users to view images for all bid requests
CREATE POLICY "All authenticated users can view images for market view" 
ON public.images 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.bid_requests br
    WHERE br.id = images.bid_request_id
  )
);

COMMENT ON POLICY "All authenticated users can view images for market view" ON public.images IS 
'Allows all authenticated users to view images for all bid requests for the Market View page. INSERT/UPDATE/DELETE operations remain restricted by existing policies.';

-- Allow all authenticated users to view bid responses for all bid requests
CREATE POLICY "All authenticated users can view bid responses for market view" 
ON public.bid_responses 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.bid_requests br
    WHERE br.id = bid_responses.bid_request_id
  )
);

COMMENT ON POLICY "All authenticated users can view bid responses for market view" ON public.bid_responses IS 
'Allows all authenticated users to view bid responses for all bid requests for the Market View page. INSERT/UPDATE/DELETE operations remain restricted by existing policies.';

-- Allow all authenticated users to view vehicles for all bid requests
-- This policy complements the existing vehicles policy and allows viewing vehicles
-- that are associated with any bid request (for Market View)
CREATE POLICY "All authenticated users can view vehicles for market view" 
ON public.vehicles 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM public.bid_requests br
    WHERE br.vehicle_id = vehicles.id
  )
);

COMMENT ON POLICY "All authenticated users can view vehicles for market view" ON public.vehicles IS 
'Allows all authenticated users to view vehicles associated with any bid request for the Market View page. This complements existing account-scoped policies. INSERT/UPDATE/DELETE operations remain restricted by existing policies.';

