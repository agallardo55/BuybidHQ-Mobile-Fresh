-- Drop the existing unique constraint on user_id only
ALTER TABLE mfa_settings DROP CONSTRAINT IF EXISTS mfa_settings_user_id_key;

-- Add a composite unique constraint on (user_id, method)
ALTER TABLE mfa_settings ADD CONSTRAINT mfa_settings_user_id_method_key UNIQUE (user_id, method);

-- Update the trigger function to handle the new constraint properly
CREATE OR REPLACE FUNCTION create_mfa_settings()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default email MFA setting for new users
    INSERT INTO mfa_settings (user_id, method, status)
    VALUES (NEW.id, 'email', 'disabled')
    ON CONFLICT (user_id, method) DO NOTHING;
    
    -- Insert default SMS MFA setting for new users  
    INSERT INTO mfa_settings (user_id, method, status)
    VALUES (NEW.id, 'sms', 'disabled')
    ON CONFLICT (user_id, method) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;