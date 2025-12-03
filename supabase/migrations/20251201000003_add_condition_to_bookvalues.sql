-- Add condition column to bookValues table
-- This stores the vehicle condition used for book value lookup

ALTER TABLE public."bookValues"
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'good';

-- Add constraint for valid values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'book_values_condition_check'
  ) THEN
    ALTER TABLE public."bookValues"
    ADD CONSTRAINT book_values_condition_check 
    CHECK (condition IN ('excellent', 'veryGood', 'good', 'fair'));
  END IF;
END $$;

COMMENT ON COLUMN public."bookValues".condition IS 
'Vehicle condition used for book value lookup: excellent, veryGood, good, fair';
