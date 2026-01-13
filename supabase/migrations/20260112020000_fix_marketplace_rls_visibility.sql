-- Fix Marketplace RLS to show all bid requests to all authenticated users
-- Problem: Regular users only see 4 bid requests, super admins see 31
-- Root cause: Restrictive RLS policy blocks Marketplace access

-- Drop all existing SELECT policies on bid_requests
DROP POLICY IF EXISTS "Users can read their own bid requests, admins see all" ON public.bid_requests;
DROP POLICY IF EXISTS "All authenticated users can view bid requests for market view" ON public.bid_requests;
DROP POLICY IF EXISTS "Account users can read bid requests" ON public.bid_requests;

-- Create single permissive policy: All authenticated users see all bid requests
-- Application code handles filtering:
-- - Dashboard: Filters by user_id (shows only my requests)
-- - Marketplace: No filter (shows all 31 requests)
CREATE POLICY "Authenticated users can view all bid requests"
ON public.bid_requests
FOR SELECT
TO authenticated
USING (true);

COMMENT ON POLICY "Authenticated users can view all bid requests" ON public.bid_requests IS
'All authenticated users can view all bid requests globally. Application-level filtering happens in queries: Dashboard filters by user_id (scope=user), Marketplace shows all (scope=global). Price visibility is controlled by canUserSeePrices() helper based on subscription plan.';
