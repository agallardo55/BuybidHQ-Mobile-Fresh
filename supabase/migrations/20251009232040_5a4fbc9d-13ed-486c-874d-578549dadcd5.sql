-- Drop the view approach
DROP VIEW IF EXISTS public.carousel_listings;

-- Create super-restrictive RLS policies for carousel data only
-- Only show approved bids from last 30 days, limit what fields anon can see

-- Bid Requests: anon can only see approved, recent bids (no user/account IDs exposed)
CREATE POLICY "Public carousel: approved recent bid requests only"
ON bid_requests FOR SELECT TO anon
USING (
  status = 'Approved' 
  AND created_at >= NOW() - INTERVAL '30 days'
);

-- Vehicles: anon can only see vehicles linked to approved carousel bids
CREATE POLICY "Public carousel: vehicles in approved bids only"
ON vehicles FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.vehicle_id = vehicles.id
    AND br.status = 'Approved'
    AND br.created_at >= NOW() - INTERVAL '30 days'
  )
);

-- Bid Responses: anon can only see offers for approved carousel bids
CREATE POLICY "Public carousel: responses for approved bids only"
ON bid_responses FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.id = bid_responses.bid_request_id
    AND br.status = 'Approved'
    AND br.created_at >= NOW() - INTERVAL '30 days'
  )
);

-- Images: anon can only see images for approved carousel bids
CREATE POLICY "Public carousel: images for approved bids only"
ON images FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.id = images.bid_request_id
    AND br.status = 'Approved'
    AND br.created_at >= NOW() - INTERVAL '30 days'
  )
);

-- Grant SELECT back to anon (we revoked it earlier)
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT ON public.bid_requests TO anon;
GRANT SELECT ON public.bid_responses TO anon;
GRANT SELECT ON public.images TO anon;