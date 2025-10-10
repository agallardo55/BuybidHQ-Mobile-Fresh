-- Enable RLS on vehicles_public view
ALTER VIEW vehicles_public SET (security_invoker = on);

-- Allow anonymous users to view vehicles from approved bid requests for the carousel
CREATE POLICY "Public carousel: allow anon to view recent approved vehicles"
ON vehicles
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM bid_requests br
    WHERE br.vehicle_id = vehicles.id
    AND br.status = 'Approved'
    AND br.created_at >= now() - interval '30 days'
  )
);