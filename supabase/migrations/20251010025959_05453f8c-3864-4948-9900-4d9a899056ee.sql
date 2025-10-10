-- Drop the three old restrictive policies on vehicles table
DROP POLICY IF EXISTS "Public carousel: allow anon to view recent approved vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Public carousel: vehicles from approved bids" ON public.vehicles;
DROP POLICY IF EXISTS "Public carousel: vehicles in approved bids only" ON public.vehicles;

-- Create new simple policy for anonymous access to all vehicles
CREATE POLICY "Public carousel: all vehicles for anon"
ON public.vehicles
FOR SELECT
TO anon
USING (true);