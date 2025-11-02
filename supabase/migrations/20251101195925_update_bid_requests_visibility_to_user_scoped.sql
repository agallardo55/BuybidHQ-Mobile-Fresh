-- Update bid_requests SELECT policy to user-scoped visibility
-- Admins/Super Admins can see all globally, regular users see only their own
-- This applies to BidRequestDashboard - Marketplace uses separate Market View policy

-- Drop existing account-scoped SELECT policy
DROP POLICY IF EXISTS "Account users can read bid requests" ON public.bid_requests;

-- Create new user-scoped SELECT policy
-- Admins (role = 'admin' OR app_role = 'account_admin') and Super Admins (app_role = 'super_admin') can see all
-- Regular users can only see their own bid requests (user_id = auth.uid())
CREATE POLICY "Users can read their own bid requests, admins see all" ON public.bid_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true OR app_role = 'super_admin'
  )
  OR bid_requests.user_id = auth.uid()
);

COMMENT ON POLICY "Users can read their own bid requests, admins see all" ON public.bid_requests IS 
'Users can only see bid requests they created (user_id = auth.uid()). Admins and Super Admins can see all bid requests globally. Marketplace page uses separate Market View policy to show all bid requests.';

