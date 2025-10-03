-- Fix the accounts RLS policy to handle signup timing correctly
DROP POLICY IF EXISTS "Users can create their first account only" ON accounts;

CREATE POLICY "Users can create their first account only"
ON accounts
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1
    FROM buybidhq_users
    WHERE buybidhq_users.id = auth.uid()
    AND buybidhq_users.account_id IS NOT NULL
  )
);