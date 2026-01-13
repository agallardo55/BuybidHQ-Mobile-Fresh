-- Fix case-sensitivity bug in check_email_exists function
-- The function was doing case-sensitive comparison which caused false positives
-- (frontend showed "available" for emails that existed with different casing)

CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  email_exists BOOLEAN;
BEGIN
  -- Check if email exists in auth.users table (case-insensitive)
  -- Exclude soft-deleted users
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE LOWER(email) = LOWER(email_to_check)
    AND deleted_at IS NULL
  ) INTO email_exists;

  RETURN email_exists;
END;
$$;

-- Update comment for documentation
COMMENT ON FUNCTION public.check_email_exists IS 'Checks if an email address is already registered (case-insensitive). Returns true if exists, false if available. Does not expose any user data.';
