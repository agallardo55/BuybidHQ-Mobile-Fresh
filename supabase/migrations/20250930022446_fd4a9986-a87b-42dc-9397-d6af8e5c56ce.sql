-- Add soft delete columns to buyers table
ALTER TABLE buyers 
ADD COLUMN deleted_at TIMESTAMPTZ NULL,
ADD COLUMN deleted_by UUID NULL REFERENCES buybidhq_users(id),
ADD COLUMN deletion_reason TEXT NULL;

-- Add index for better query performance
CREATE INDEX idx_buyers_deleted_at ON buyers(deleted_at);

-- Add comments for documentation
COMMENT ON COLUMN buyers.deleted_at IS 'Timestamp when the buyer was soft deleted. NULL means active.';
COMMENT ON COLUMN buyers.deleted_by IS 'User ID who deleted the buyer';
COMMENT ON COLUMN buyers.deletion_reason IS 'Optional reason for deletion';