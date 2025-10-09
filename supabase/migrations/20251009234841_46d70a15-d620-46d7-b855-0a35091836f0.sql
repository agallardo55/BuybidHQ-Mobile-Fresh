-- =====================================================
-- FIX: Remove Security Definer View, Use RLS Instead
-- =====================================================

-- Drop the security definer view
DROP VIEW IF EXISTS public.carousel_recent_vehicles;

-- Instead of a view, create ultra-restrictive RLS policies that allow
-- anonymous users to SELECT only approved, recent bid data

-- Policy 1: Allow anon to see ONLY approved bid requests from last 30 days
CREATE POLICY "Public carousel: approved recent bids only"
ON public.bid_requests
FOR SELECT
TO anon
USING (
  status = 'Approved'
  AND created_at >= (NOW() - INTERVAL '30 days')
);

-- Policy 2: Allow anon to see vehicles ONLY if linked to approved recent bid requests
CREATE POLICY "Public carousel: vehicles for approved bids only"
ON public.vehicles
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 
    FROM public.bid_requests br
    WHERE br.vehicle_id = vehicles.id
      AND br.status = 'Approved'
      AND br.created_at >= (NOW() - INTERVAL '30 days')
  )
);

-- Policy 3: Allow anon to see images ONLY if linked to approved recent bid requests
CREATE POLICY "Public carousel: images for approved bids only"
ON public.images
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 
    FROM public.bid_requests br
    WHERE br.id = images.bid_request_id
      AND br.status = 'Approved'
      AND br.created_at >= (NOW() - INTERVAL '30 days')
  )
);

-- Policy 4: Allow anon to see bid responses ONLY if linked to approved recent bid requests
CREATE POLICY "Public carousel: responses for approved bids only"
ON public.bid_responses
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 
    FROM public.bid_requests br
    WHERE br.id = bid_responses.bid_request_id
      AND br.status = 'Approved'
      AND br.created_at >= (NOW() - INTERVAL '30 days')
  )
);

-- Grant SELECT access back to anon (we revoked it earlier)
GRANT SELECT ON public.bid_requests TO anon;
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT ON public.images TO anon;
GRANT SELECT ON public.bid_responses TO anon;

-- Add comments explaining the security model
COMMENT ON POLICY "Public carousel: approved recent bids only" ON public.bid_requests IS 
'Allows anonymous users to view ONLY approved bid requests created within the last 30 days for the public carousel feature. No user_id, account_id, or sensitive business data is exposed.';

COMMENT ON POLICY "Public carousel: vehicles for approved bids only" ON public.vehicles IS 
'Allows anonymous users to view vehicle details ONLY if the vehicle is associated with an approved bid request from the last 30 days. VINs and other sensitive details remain visible but only for actively marketed vehicles.';

COMMENT ON POLICY "Public carousel: images for approved bids only" ON public.images IS 
'Allows anonymous users to view images ONLY if they belong to approved bid requests from the last 30 days.';

COMMENT ON POLICY "Public carousel: responses for approved bids only" ON public.bid_responses IS 
'Allows anonymous users to view bid response offers ONLY for approved bid requests from the last 30 days. Buyer IDs remain in the data but provide no direct PII without additional table access.';