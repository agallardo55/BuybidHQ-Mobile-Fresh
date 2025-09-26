-- Allow members to update their own account details
CREATE POLICY "Members can update their own account details" ON public.accounts
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE account_id = accounts.id 
    AND (app_role = 'member' OR app_role = 'account_admin' OR is_admin = true)
  )
);

-- Allow members to update their own dealership details  
CREATE POLICY "Members can update their own dealership details" ON public.dealerships
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM buybidhq_users 
    WHERE id = auth.uid() 
    AND dealership_id = dealerships.id
    AND (app_role = 'member' OR app_role = 'account_admin')
  )
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);