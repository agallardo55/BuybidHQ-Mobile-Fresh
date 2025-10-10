-- Update bid_requests policy to show all bid requests (no time restriction)
DROP POLICY IF EXISTS "Public carousel: recent bids for anon" ON public.bid_requests;

CREATE POLICY "Public carousel: all bids for anon"
ON public.bid_requests
FOR SELECT
TO anon
USING (true);

-- Update bid_responses policy to show all responses (no time restriction)
DROP POLICY IF EXISTS "Public carousel: responses for approved bids only" ON public.bid_responses;

CREATE POLICY "Public carousel: all responses for anon"
ON public.bid_responses
FOR SELECT
TO anon
USING (true);

-- Update images policy to show all images (no time restriction)
DROP POLICY IF EXISTS "Public carousel: images for approved bids only" ON public.images;

CREATE POLICY "Public carousel: all images for anon"
ON public.images
FOR SELECT
TO anon
USING (true);