-- Create a function to check if an email exists in auth.users
-- This is safe to expose because it only returns true/false
-- No user data is exposed, only availability status

CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  email_exists BOOLEAN;
BEGIN
  -- Check if email exists in auth.users table
  -- Exclude soft-deleted users
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = email_to_check
    AND deleted_at IS NULL
  ) INTO email_exists;
  
  RETURN email_exists;
END;
$$;

-- Grant execute permission to authenticated and anon users
-- This allows the signup form to check email availability
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.check_email_exists IS 'Checks if an email address is already registered. Returns true if exists, false if available. Does not expose any user data.';

