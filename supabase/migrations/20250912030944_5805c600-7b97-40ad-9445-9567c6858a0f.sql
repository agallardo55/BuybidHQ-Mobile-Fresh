-- Critical Security Fix: Replace insecure unified_dealer_info view with secure function
-- The current view exposes sensitive dealer business information publicly

-- Drop the existing insecure view
DROP VIEW IF EXISTS unified_dealer_info;

-- Create a secure function that applies proper access controls
CREATE OR REPLACE FUNCTION get_unified_dealer_info()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    dealer_type dealer_type,
    business_name text,
    license_number character varying,
    business_phone text,
    business_email text,
    address text,
    city text,
    state text,
    zip_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allow admins or users viewing their own dealership info
    IF NOT (is_admin(auth.uid()) OR auth.uid() IS NOT NULL) THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        d.id,
        d.primary_user_id as user_id,
        d.dealer_type,
        d.dealer_name as business_name,
        d.license_number,
        d.business_phone,
        d.business_email,
        d.address,
        d.city,
        d.state,
        d.zip_code
    FROM dealerships d
    WHERE 
        -- Admins can see all
        is_admin(auth.uid()) 
        -- Users can only see their own dealership
        OR d.id = (
            SELECT dealership_id FROM buybidhq_users 
            WHERE id = auth.uid()
        );
END;
$$;