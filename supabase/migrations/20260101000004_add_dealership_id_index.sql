-- Add performance index on buybidhq_users.dealership_id
-- Improves query performance when looking up users by their dealership

CREATE INDEX IF NOT EXISTS idx_buybidhq_users_dealership_id
ON public.buybidhq_users(dealership_id)
WHERE dealership_id IS NOT NULL;

COMMENT ON INDEX public.idx_buybidhq_users_dealership_id IS
  'Performance index for looking up users by dealership. Filters NULL values for efficiency.';
