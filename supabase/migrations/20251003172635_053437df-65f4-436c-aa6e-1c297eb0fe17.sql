-- Fix enum type casting in create_mfa_settings function
CREATE OR REPLACE FUNCTION public.create_mfa_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Insert only SMS MFA setting for new users (enabled if they have a validated phone)
    INSERT INTO mfa_settings (user_id, method, status)
    VALUES (
        NEW.id, 
        'sms', 
        (CASE 
            WHEN NEW.mobile_number IS NOT NULL AND NEW.phone_validated = true 
            THEN 'enabled' 
            ELSE 'disabled' 
        END)::mfa_status
    )
    ON CONFLICT (user_id, method) DO NOTHING;
    
    RETURN NEW;
END;
$$;