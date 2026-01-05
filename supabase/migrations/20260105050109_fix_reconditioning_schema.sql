-- Comprehensive schema update for reconditioning table to support new bid request form fields
-- This migration ensures all form fields have corresponding database columns with appropriate constraints

-- 1. Add history column if it doesn't exist (for vehicle accident/title history)
ALTER TABLE reconditioning 
ADD COLUMN IF NOT EXISTS history TEXT DEFAULT 'unknown';

COMMENT ON COLUMN reconditioning.history IS 
'Vehicle accident/title history status: noAccidents, minorAccident, odomError, majorAccident, brandedIssue, unknown, notSpecified';

-- 2. Add history_service column if it doesn't exist (for history report provider)
ALTER TABLE reconditioning 
ADD COLUMN IF NOT EXISTS history_service TEXT DEFAULT 'Unknown';

COMMENT ON COLUMN reconditioning.history_service IS 
'Vehicle history report provider: CarFax, AutoCheck, or Unknown';

-- 3. Remove overly restrictive constraints on brakes and tires
-- These columns now store EITHER status keywords OR numeric measurements
ALTER TABLE reconditioning 
DROP CONSTRAINT IF EXISTS reconditioning_brakes_check;

ALTER TABLE reconditioning 
DROP CONSTRAINT IF EXISTS reconditioning_tires_check;

ALTER TABLE reconditioning 
DROP CONSTRAINT IF EXISTS reconditioning_history_check;

-- 4. Add flexible constraints that allow both formats

-- Brakes: Either status keywords OR comma-separated measurements in mm
ALTER TABLE reconditioning 
ADD CONSTRAINT reconditioning_brakes_check 
CHECK (
  brakes IS NULL OR
  brakes IN ('acceptable', 'replaceFront', 'replaceRear', 'replaceAll', 'notSpecified') OR
  brakes ~ '^[0-9]+(\s*,\s*[0-9]+)*$'  -- Allow comma-separated numbers (e.g., "8,8,7,6")
);

-- Tires: Either status keywords OR comma-separated measurements in 32nds
ALTER TABLE reconditioning 
ADD CONSTRAINT reconditioning_tires_check 
CHECK (
  tires IS NULL OR
  tires IN ('acceptable', 'replaceFront', 'replaceRear', 'replaceAll', 'notSpecified') OR
  tires ~ '^[0-9]+(\s*,\s*[0-9]+)*$'  -- Allow comma-separated numbers (e.g., "9,8,7,8")
);

-- History: Allow all valid history status values
ALTER TABLE reconditioning 
ADD CONSTRAINT reconditioning_history_check 
CHECK (
  history IS NULL OR
  history IN ('noAccidents', 'minorAccident', 'odomError', 'majorAccident', 'brandedIssue', 'unknown', 'notSpecified')
);

-- Add helpful comments on constraints
COMMENT ON CONSTRAINT reconditioning_brakes_check ON reconditioning IS 
'Allows either status keywords (acceptable, replaceFront, etc.) or comma-separated measurements in mm (e.g., "8,8,7,6" for FL,FR,RL,RR)';

COMMENT ON CONSTRAINT reconditioning_tires_check ON reconditioning IS 
'Allows either status keywords (acceptable, replaceFront, etc.) or comma-separated measurements in 32nds (e.g., "9,8,7,8" for FL,FR,RL,RR)';
