-- Grant SELECT on vehicles table to anonymous users
-- The RLS policy already restricts to approved bids only
GRANT SELECT ON public.vehicles TO anon;