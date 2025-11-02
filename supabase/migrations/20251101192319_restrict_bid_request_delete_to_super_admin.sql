-- Restrict bid request deletion to super admins only
-- This ensures only super_admin users (paid or unpaid) can delete bid requests

-- Step 1: Drop the existing FOR ALL policy on bid_requests
DROP POLICY IF EXISTS "Users can manage their account bid requests" ON public.bid_requests;

-- Step 2: Create separate policies for SELECT, INSERT, UPDATE (account-scoped)
-- SELECT: Account users can view bid requests in their account
CREATE POLICY "Account users can read bid requests" ON public.bid_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE account_id = bid_requests.account_id OR is_admin = true
  )
);

-- INSERT: Account users can create bid requests in their account
CREATE POLICY "Account users can create bid requests" ON public.bid_requests
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE account_id = bid_requests.account_id OR is_admin = true
  )
);

-- UPDATE: Account users can update bid requests in their account
CREATE POLICY "Account users can update bid requests" ON public.bid_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE account_id = bid_requests.account_id OR is_admin = true
  )
);

-- DELETE: Only super_admin can delete bid requests
CREATE POLICY "Only super admin can delete bid requests" ON public.bid_requests
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE app_role = 'super_admin'
  )
);

-- Step 3: Update bid_responses DELETE policy to only allow super_admin
DROP POLICY IF EXISTS "Users and super admin access to bid responses" ON public.bid_responses;

-- SELECT/INSERT/UPDATE: Keep account-scoped access (through bid_requests relationship)
CREATE POLICY "Account users can view bid responses" ON public.bid_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.id = bid_responses.bid_request_id
    AND EXISTS (
      SELECT 1 FROM get_current_user_data() u
      WHERE u.account_id = br.account_id
    )
  )
);

CREATE POLICY "Account users can create bid responses" ON public.bid_responses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.id = bid_responses.bid_request_id
    AND EXISTS (
      SELECT 1 FROM get_current_user_data() u
      WHERE u.account_id = br.account_id
    )
  )
);

CREATE POLICY "Account users can update bid responses" ON public.bid_responses
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.id = bid_responses.bid_request_id
    AND EXISTS (
      SELECT 1 FROM get_current_user_data() u
      WHERE u.account_id = br.account_id
    )
  )
);

-- DELETE: Only super_admin can delete bid responses
CREATE POLICY "Only super admin can delete bid responses" ON public.bid_responses
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE app_role = 'super_admin'
  )
);

-- Step 4: Update images DELETE policy to only allow super_admin (already exists, but ensure it checks app_role)
DROP POLICY IF EXISTS "Super admin can delete images" ON public.images;

CREATE POLICY "Only super admin can delete images" ON public.images
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE app_role = 'super_admin'
  )
);

-- Step 5: Update bid_submission_tokens DELETE policy to only allow super_admin
DROP POLICY IF EXISTS "Super admin can delete bid tokens" ON public.bid_submission_tokens;

CREATE POLICY "Only super admin can delete bid tokens" ON public.bid_submission_tokens
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE app_role = 'super_admin'
  )
);

-- Step 6: Update bid_request_access policies - split FOR ALL to restrict DELETE to super_admin only
DROP POLICY IF EXISTS "Super admin access to bid request access" ON public.bid_request_access;

-- SELECT/INSERT/UPDATE: Keep admin access (is_admin = true allows both legacy admin and super_admin)
CREATE POLICY "Admin can view bid request access" ON public.bid_request_access
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

CREATE POLICY "Admin can insert bid request access" ON public.bid_request_access
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

CREATE POLICY "Admin can update bid request access" ON public.bid_request_access
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- DELETE: Only super_admin can delete bid request access
CREATE POLICY "Only super admin can delete bid request access" ON public.bid_request_access
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE app_role = 'super_admin'
  )
);

COMMENT ON POLICY "Only super admin can delete bid requests" ON public.bid_requests IS 
'Restricts bid request deletion to super_admin users only. All other users (including account_admin, manager, member) cannot delete bid requests.';

COMMENT ON POLICY "Only super admin can delete bid responses" ON public.bid_responses IS 
'Restricts bid response deletion to super_admin users only. This ensures only super admins can clean up bid responses when deleting bid requests.';

COMMENT ON POLICY "Only super admin can delete images" ON public.images IS 
'Restricts image deletion to super_admin users only. This ensures only super admins can clean up images when deleting bid requests.';

COMMENT ON POLICY "Only super admin can delete bid tokens" ON public.bid_submission_tokens IS 
'Restricts bid submission token deletion to super_admin users only. This ensures only super admins can clean up tokens when deleting bid requests.';

