-- Allow bid request owners to see buyers they've invited
-- This fixes the issue where users couldn't see invited buyers in the Offers tab
-- after the RLS policy was changed to user-scoped visibility
--
-- The exception allows users to see buyers they've invited to their bid requests,
-- even if they don't own those buyer records. This ensures:
-- 1. Historical bid requests (created before user-scoped RLS) still show all invited buyers
-- 2. Future bid requests can display all invited buyers in the Offers tab
-- 3. Users still cannot see buyers they haven't invited (privacy maintained)

-- Update the SELECT policy to include bid request exception
DROP POLICY IF EXISTS "Admins see all buyers, users see their own" ON public.buyers;

CREATE POLICY "Admins see all buyers, users see their own" ON public.buyers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true OR app_role = 'super_admin'
  )
  OR buyers.owner_user_id = auth.uid()
  -- Allow users to see buyers they've invited to their bid requests
  OR EXISTS (
    SELECT 1 FROM bid_submission_tokens bst
    JOIN bid_requests br ON br.id = bst.bid_request_id
    WHERE bst.buyer_id = buyers.id
    AND br.user_id = auth.uid()
  )
);

COMMENT ON POLICY "Admins see all buyers, users see their own" ON public.buyers IS 
'Super Admins and Admins (role = admin OR app_role = account_admin) can view all buyers globally. Regular users can view buyers where owner_user_id = auth.uid() OR buyers they have invited to their bid requests.';

