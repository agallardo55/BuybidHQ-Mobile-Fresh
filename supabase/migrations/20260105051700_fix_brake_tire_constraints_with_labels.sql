-- Fix brake and tire constraints to allow labeled format
-- Formats allowed:
--   1. Simple: "8,8,7,6" (just numbers)
--   2. Labeled: "frontLeft:8,frontRight:8,rearLeft:7,rearRight:6"
--   3. Keywords: "acceptable", "replaceFront", etc.

ALTER TABLE reconditioning 
DROP CONSTRAINT IF EXISTS reconditioning_brakes_check;

ALTER TABLE reconditioning 
DROP CONSTRAINT IF EXISTS reconditioning_tires_check;

-- Brakes: Allow keywords, simple numbers, OR labeled format
ALTER TABLE reconditioning 
ADD CONSTRAINT reconditioning_brakes_check 
CHECK (
  brakes IS NULL OR
  brakes IN ('acceptable', 'replaceFront', 'replaceRear', 'replaceAll', 'notSpecified') OR
  brakes ~ '^[0-9]+(\s*,\s*[0-9]+)*$' OR  -- Simple: "8,8,7,6"
  brakes ~ '^(frontLeft|frontRight|rearLeft|rearRight):[0-9]+(\s*,\s*(frontLeft|frontRight|rearLeft|rearRight):[0-9]+)*$'  -- Labeled
);

-- Tires: Allow keywords, simple numbers, OR labeled format
ALTER TABLE reconditioning 
ADD CONSTRAINT reconditioning_tires_check 
CHECK (
  tires IS NULL OR
  tires IN ('acceptable', 'replaceFront', 'replaceRear', 'replaceAll', 'notSpecified') OR
  tires ~ '^[0-9]+(\s*,\s*[0-9]+)*$' OR  -- Simple: "9,8,7,8"
  tires ~ '^(frontLeft|frontRight|rearLeft|rearRight):[0-9]+(\s*,\s*(frontLeft|frontRight|rearLeft|rearRight):[0-9]+)*$'  -- Labeled
);

COMMENT ON CONSTRAINT reconditioning_brakes_check ON reconditioning IS 
'Allows: (1) keywords (acceptable, replaceFront, etc.), (2) simple numbers "8,8,7,6", or (3) labeled format "frontLeft:8,frontRight:8,rearLeft:7,rearRight:6"';

COMMENT ON CONSTRAINT reconditioning_tires_check ON reconditioning IS 
'Allows: (1) keywords (acceptable, replaceFront, etc.), (2) simple numbers "9,8,7,8", or (3) labeled format "frontLeft:9,frontRight:8,rearLeft:7,rearRight:8"';
