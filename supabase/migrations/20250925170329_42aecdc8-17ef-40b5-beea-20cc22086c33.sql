-- Disable email MFA for all existing users and set SMS as the only MFA method
UPDATE mfa_settings 
SET status = 'disabled' 
WHERE method = 'email';

-- Update MFA settings to ensure SMS is enabled for users who have phone numbers
UPDATE mfa_settings 
SET status = 'enabled' 
WHERE method = 'sms' 
AND user_id IN (
  SELECT id FROM buybidhq_users 
  WHERE mobile_number IS NOT NULL 
  AND phone_validated = true
);

-- Update the create_mfa_settings trigger to only create SMS MFA settings
CREATE OR REPLACE FUNCTION public.create_mfa_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Insert only SMS MFA setting for new users (enabled if they have a validated phone)
    INSERT INTO mfa_settings (user_id, method, status)
    VALUES (
        NEW.id, 
        'sms', 
        CASE 
            WHEN NEW.mobile_number IS NOT NULL AND NEW.phone_validated = true 
            THEN 'enabled' 
            ELSE 'disabled' 
        END
    )
    ON CONFLICT (user_id, method) DO NOTHING;
    
    RETURN NEW;
END;
$function$;