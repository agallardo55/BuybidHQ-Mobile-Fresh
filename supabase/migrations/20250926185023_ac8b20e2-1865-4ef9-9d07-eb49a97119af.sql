-- Remove global email uniqueness constraint from buyers table
-- This allows multiple accounts to have buyers with the same email address

ALTER TABLE buyers DROP CONSTRAINT IF EXISTS buyers_email_unique;

-- Add a comment to document the change
COMMENT ON TABLE buyers IS 'Buyers table allows duplicate emails across different accounts. Account-level isolation is handled by RLS policies.';