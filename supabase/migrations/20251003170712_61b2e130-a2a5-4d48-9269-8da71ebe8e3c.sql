-- Allow authenticated users to create their first account during signup
CREATE POLICY "Users can create their first account only"
ON accounts
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only allow insert if the user doesn't already have an account
  NOT EXISTS (
    SELECT 1 FROM buybidhq_users
    WHERE buybidhq_users.id = auth.uid()
    AND buybidhq_users.account_id IS NOT NULL
  )
);