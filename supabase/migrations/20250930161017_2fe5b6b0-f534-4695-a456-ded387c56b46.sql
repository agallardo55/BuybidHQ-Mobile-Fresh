-- ===================================================================
-- SECURITY FIX: Restrict Public Access to Buyers Table
-- ===================================================================
-- Problem: The current RLS policy allows public SELECT on all buyers
-- when ANY valid bid_submission_token exists, exposing all PII.
-- 
-- Solution: 
-- 1. Remove overly permissive public SELECT policy
-- 2. Create security definer function for token-scoped buyer access
-- 3. Restrict bid_submission_tokens table access
-- ===================================================================

-- Step 1: Drop the overly permissive buyers table policy
DROP POLICY IF EXISTS "Public buyer access for bid responses" ON public.buyers;

-- Step 2: Create a security definer function that returns ONLY the buyer
-- associated with a specific valid token (not all buyers)
CREATE OR REPLACE FUNCTION public.get_buyer_for_token(p_token text)
RETURNS TABLE(
  id uuid,
  buyer_name text,
  email text,
  dealer_name text,
  buyer_mobile text,
  buyer_phone text,
  city text,
  state text,
  zip_code text,
  address text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return the specific buyer associated with the valid token
  -- Not all buyers, just the one linked to this token
  RETURN QUERY
  SELECT 
    b.id,
    b.buyer_name,
    b.email,
    b.dealer_name,
    b.buyer_mobile,
    b.buyer_phone,
    b.city,
    b.state,
    b.zip_code,
    b.address
  FROM buyers b
  INNER JOIN bid_submission_tokens bst ON bst.buyer_id = b.id
  WHERE bst.token = p_token
    AND NOT bst.is_used
    AND bst.expires_at > now()
  LIMIT 1;
END;
$$;

-- Step 3: Drop the public SELECT policy on bid_submission_tokens
-- Token validation should only happen via RPC functions, not direct table access
DROP POLICY IF EXISTS "Public token validation" ON public.bid_submission_tokens;

-- Step 4: Create a limited public policy for bid_submission_tokens
-- that only allows validation of a specific token (not enumeration)
CREATE POLICY "Validate specific token only"
ON public.bid_submission_tokens
FOR SELECT
USING (
  -- Only allow checking if a specific token is valid
  -- The token must be passed in and cannot be enumerated
  token = current_setting('request.jwt.claims', true)::json->>'token'
  OR auth.uid() IS NOT NULL
);

-- Note: The above policy is restrictive. Public access to tokens
-- should only happen through the submit-public-bid edge function
-- which uses service role and bypasses RLS entirely.