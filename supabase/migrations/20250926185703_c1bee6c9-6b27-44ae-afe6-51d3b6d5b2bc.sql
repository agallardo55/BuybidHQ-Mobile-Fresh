-- Drop the unique index that prevents duplicate emails across accounts
-- The previous migration only tried to drop a constraint, but the unique index still exists

DROP INDEX IF EXISTS buyers_email_unique;

-- Verify no other email-related constraints exist
-- This ensures buyers can have duplicate emails across different accounts
-- while still maintaining account-level isolation through RLS policies

COMMENT ON TABLE buyers IS 'Buyers table allows duplicate emails across different accounts. Account-level isolation is handled by RLS policies.';