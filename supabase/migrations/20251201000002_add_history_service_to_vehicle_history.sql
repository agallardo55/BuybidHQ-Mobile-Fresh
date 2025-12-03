-- Add history_service column to vehicle_history table
-- This stores which vehicle history report provider was selected (AutoCheck or CarFax)

ALTER TABLE public.vehicle_history
ADD COLUMN IF NOT EXISTS history_service TEXT;

-- Add constraint for valid values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_history_service_check'
  ) THEN
    ALTER TABLE public.vehicle_history
    ADD CONSTRAINT vehicle_history_service_check 
    CHECK (history_service IS NULL OR history_service IN ('AutoCheck', 'CarFax'));
  END IF;
END $$;

COMMENT ON COLUMN public.vehicle_history.history_service IS 
'Selected vehicle history report provider: AutoCheck or CarFax';
