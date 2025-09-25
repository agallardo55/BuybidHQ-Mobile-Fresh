-- Systematic fix for legacy MFA users (only for users that exist in auth.users)
-- Phase 1: Create missing MFA settings for users with validated phone numbers
INSERT INTO mfa_settings (user_id, method, status)
SELECT 
    u.id,
    'sms'::mfa_method,
    CASE 
        WHEN u.phone_validated = true AND u.mobile_number IS NOT NULL 
        THEN 'enabled'::mfa_status 
        ELSE 'disabled'::mfa_status 
    END
FROM buybidhq_users u
WHERE u.deleted_at IS NULL
AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.id)  -- Only users that exist in auth.users
AND NOT EXISTS (
    SELECT 1 FROM mfa_settings ms 
    WHERE ms.user_id = u.id AND ms.method = 'sms'
)
ON CONFLICT (user_id, method) DO NOTHING;

-- Phase 2: Enable SMS MFA and consent for users with validated phone numbers
UPDATE buybidhq_users 
SET sms_consent = true
WHERE phone_validated = true 
AND mobile_number IS NOT NULL 
AND deleted_at IS NULL
AND sms_consent = false
AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = buybidhq_users.id);

-- Update MFA settings to enabled for users with validated phones
UPDATE mfa_settings 
SET 
    status = 'enabled'::mfa_status,
    last_verified = now()
WHERE method = 'sms'
AND user_id IN (
    SELECT u.id FROM buybidhq_users u
    WHERE u.phone_validated = true 
    AND u.mobile_number IS NOT NULL 
    AND u.deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.id)
)
AND status = 'disabled';