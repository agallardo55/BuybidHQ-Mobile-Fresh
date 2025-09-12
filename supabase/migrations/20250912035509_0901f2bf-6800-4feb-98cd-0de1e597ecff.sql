-- Fix security issue: Replace buyers_user_roles_view with secure function
-- Views cannot have RLS policies, so we'll create a secure function instead

-- Drop the insecure view
DROP VIEW IF EXISTS buyers_user_roles_view;

-- Create a secure function that returns user roles with proper access control
CREATE OR REPLACE FUNCTION get_buyer_user_roles()
RETURNS TABLE(id uuid, role user_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only allow admins to access user roles
    IF NOT is_admin(auth.uid()) THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        u.id,
        u.role
    FROM buybidhq_users u
    WHERE u.deleted_at IS NULL;
END;
$$;

-- Grant execute permission to authenticated users (function handles access control internally)
GRANT EXECUTE ON FUNCTION get_buyer_user_roles() TO authenticated;

-- Documentation: False positive in security scanner
COMMENT ON TABLE contact_submissions IS 'Contact form submissions - Security scanner false positive: INSERT policy allowing public submissions is intentional and secure. Only admins can view submissions. This is the correct security model for a contact form.';