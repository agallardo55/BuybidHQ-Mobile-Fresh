-- Update the create_mfa_settings function to set SMS MFA as enabled by default
CREATE OR REPLACE FUNCTION public.create_mfa_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    -- Insert default email MFA setting for new users (disabled)
    INSERT INTO mfa_settings (user_id, method, status)
    VALUES (NEW.id, 'email', 'disabled')
    ON CONFLICT (user_id, method) DO NOTHING;
    
    -- Insert default SMS MFA setting for new users (enabled)
    INSERT INTO mfa_settings (user_id, method, status)
    VALUES (NEW.id, 'sms', 'enabled')
    ON CONFLICT (user_id, method) DO NOTHING;
    
    RETURN NEW;
END;
$function$;

-- Update existing users to have SMS MFA enabled by default
UPDATE mfa_settings 
SET status = 'enabled'
WHERE method = 'sms' 
AND status = 'disabled';