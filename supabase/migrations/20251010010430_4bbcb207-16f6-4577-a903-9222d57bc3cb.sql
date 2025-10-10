-- Add RLS policy on vehicles table for anonymous carousel access
-- Allow anon to view vehicles that are part of approved bid requests from last 30 days
CREATE POLICY "Public carousel: vehicles from approved bids" 
ON public.vehicles 
FOR SELECT 
TO anon
USING (
  EXISTS (
    SELECT 1 
    FROM bid_requests br 
    WHERE br.vehicle_id = vehicles.id 
    AND br.status = 'Approved'::bid_status 
    AND br.created_at >= (now() - interval '30 days')
  )
);