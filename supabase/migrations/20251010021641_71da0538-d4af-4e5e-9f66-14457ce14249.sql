-- Drop the restrictive policy that only shows approved bids
DROP POLICY IF EXISTS "Public carousel: approved recent bids only" ON public.bid_requests;

-- Create new policy without status restriction
CREATE POLICY "Public carousel: recent bids for anon"
ON public.bid_requests
FOR SELECT
TO anon
USING (
  created_at >= (now() - interval '30 days')
);