-- Add history column to reconditioning table for vehicle accident/title history status
-- This stores the seller's assessment of vehicle history from the appraisal form

ALTER TABLE public.reconditioning
ADD COLUMN IF NOT EXISTS history TEXT DEFAULT 'unknown';

-- Add constraint for valid values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reconditioning_history_check'
  ) THEN
    ALTER TABLE public.reconditioning
    ADD CONSTRAINT reconditioning_history_check 
    CHECK (history IN (
      'noAccidents', 
      'minorAccident', 
      'odomError', 
      'majorAccident', 
      'brandedIssue', 
      'unknown'
    ));
  END IF;
END $$;

COMMENT ON COLUMN public.reconditioning.history IS 
'Vehicle accident/title history status from seller appraisal: noAccidents, minorAccident, odomError, majorAccident, brandedIssue, unknown';
