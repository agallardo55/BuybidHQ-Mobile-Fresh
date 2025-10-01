-- Add INSERT policy for bookValues table
-- Allow users to insert book values for their own bid requests
CREATE POLICY "Users can insert book values for their vehicles"
ON public."bookValues"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM vehicles v
    JOIN bid_requests br ON br.vehicle_id = v.id
    WHERE v.id = "bookValues".vehicle_id
    AND br.user_id = auth.uid()
  )
);

-- Add UPDATE policy for bookValues table
-- Allow users to update book values for their own bid requests
CREATE POLICY "Users can update book values for their vehicles"
ON public."bookValues"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM vehicles v
    JOIN bid_requests br ON br.vehicle_id = v.id
    WHERE v.id = "bookValues".vehicle_id
    AND br.user_id = auth.uid()
  )
);