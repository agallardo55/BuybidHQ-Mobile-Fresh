-- Add communication preference columns to buybidhq_users table
ALTER TABLE buybidhq_users 
ADD COLUMN bid_request_email_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN bid_request_sms_enabled BOOLEAN DEFAULT FALSE;

-- Add comment for clarity
COMMENT ON COLUMN buybidhq_users.bid_request_email_enabled IS 'Whether user wants to receive bid requests via email';
COMMENT ON COLUMN buybidhq_users.bid_request_sms_enabled IS 'Whether user wants to receive bid requests via SMS';