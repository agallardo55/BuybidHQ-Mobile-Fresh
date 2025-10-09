-- Add RLS policies for public carousel access

-- Policy for public to view recent bid requests
CREATE POLICY "Public can view recent bid requests for carousel"
ON bid_requests
FOR SELECT
TO anon
USING (true);

-- Policy for public to view vehicles associated with bid requests
CREATE POLICY "Public can view vehicles for carousel"
ON vehicles
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM bid_requests
    WHERE bid_requests.vehicle_id = vehicles.id
  )
);

-- Policy for public to view images associated with bid requests
CREATE POLICY "Public can view bid request images for carousel"
ON images
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM bid_requests
    WHERE bid_requests.id = images.bid_request_id
  )
);

-- Policy for public to view bid response offers for carousel
CREATE POLICY "Public can view bid response offers for carousel"
ON bid_responses
FOR SELECT
TO anon
USING (true);