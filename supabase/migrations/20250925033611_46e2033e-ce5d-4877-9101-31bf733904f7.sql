-- Update default communication preferences to prioritize SMS over email
ALTER TABLE buybidhq_users 
ALTER COLUMN bid_request_sms_enabled SET DEFAULT true;

ALTER TABLE buybidhq_users 
ALTER COLUMN bid_request_email_enabled SET DEFAULT false;

-- Update existing users to prefer SMS notifications over email
UPDATE buybidhq_users 
SET 
  bid_request_sms_enabled = true,
  bid_request_email_enabled = false
WHERE deleted_at IS NULL;