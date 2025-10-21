-- Fix buyers RLS policies to allow basic users to access buyers
-- This migration adds policies for basic/member users to access buyers in their account

-- Add policy for basic/member users to view buyers in their account
CREATE POLICY "Basic users can view account buyers" ON public.buyers
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'member'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
);

-- Add policy for basic/member users to create buyers in their account
CREATE POLICY "Basic users can create buyers" ON public.buyers
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'member'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
  AND owner_user_id = auth.uid()
);

-- Add policy for basic/member users to update buyers they own
CREATE POLICY "Basic users can update own buyers" ON public.buyers
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'member'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
  AND owner_user_id = auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'member'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
  AND owner_user_id = auth.uid()
);

-- Add policy for basic/member users to delete buyers they own
CREATE POLICY "Basic users can delete own buyers" ON public.buyers
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.buybidhq_users requester
    WHERE requester.id = auth.uid()
      AND requester.app_role = 'member'
      AND requester.account_id = buyers.account_id
      AND requester.deleted_at IS NULL
  )
  AND owner_user_id = auth.uid()
);
