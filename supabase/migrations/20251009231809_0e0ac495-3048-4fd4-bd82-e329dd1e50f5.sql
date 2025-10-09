-- Drop existing public access policies
DROP POLICY IF EXISTS "Public can view recent bid requests for carousel" ON bid_requests;
DROP POLICY IF EXISTS "Public can view bid response offers for carousel" ON bid_responses;
DROP POLICY IF EXISTS "Public can view vehicles for carousel" ON vehicles;
DROP POLICY IF EXISTS "Public can view bid request images for carousel" ON images;

-- Create a secure, read-only view for the carousel
CREATE OR REPLACE VIEW public.carousel_listings
WITH (security_barrier = true)
AS
SELECT 
  br.id,
  br.created_at,
  v.year,
  v.make,
  v.model,
  v.mileage,
  (SELECT i.image_url 
   FROM images i 
   WHERE i.bid_request_id = br.id 
   ORDER BY i.sequence_order, i.created_at 
   LIMIT 1) as image_url,
  (SELECT MAX(resp.offer_amount) 
   FROM bid_responses resp 
   WHERE resp.bid_request_id = br.id) as highest_offer
FROM bid_requests br
JOIN vehicles v ON br.vehicle_id = v.id
WHERE br.status = 'Approved'
  AND br.created_at >= NOW() - INTERVAL '30 days'
ORDER BY br.created_at DESC
LIMIT 10;

-- Grant SELECT on the view to anon (public) role
GRANT SELECT ON public.carousel_listings TO anon;

-- Revoke direct SELECT access from anon on sensitive tables
-- (Keep authenticated user access via existing RLS policies)
REVOKE SELECT ON public.vehicles FROM anon;
REVOKE SELECT ON public.bid_requests FROM anon;
REVOKE SELECT ON public.bid_responses FROM anon;
REVOKE SELECT ON public.images FROM anon;

-- Add comment for documentation
COMMENT ON VIEW public.carousel_listings IS 'Secure read-only view for public carousel. Only exposes approved bids from last 30 days with minimal vehicle info. No VINs, user IDs, or detailed specs exposed.';