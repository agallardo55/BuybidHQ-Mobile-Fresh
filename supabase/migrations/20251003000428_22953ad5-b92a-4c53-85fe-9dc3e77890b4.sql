-- Add 'notSpecified' to existing constraint values (not replacing them)

ALTER TABLE reconditioning 
DROP CONSTRAINT IF EXISTS reconditioning_windshield_check;

ALTER TABLE reconditioning 
ADD CONSTRAINT reconditioning_windshield_check 
CHECK (windshield IN ('clear', 'chips', 'smallCracks', 'largeCracks', 'notSpecified'));

ALTER TABLE reconditioning 
DROP CONSTRAINT IF EXISTS reconditioning_engine_light_check;

ALTER TABLE reconditioning 
ADD CONSTRAINT reconditioning_engine_light_check 
CHECK (engine_light IN ('none', 'engine', 'maintenance', 'mobile', 'notSpecified'));

ALTER TABLE reconditioning 
DROP CONSTRAINT IF EXISTS reconditioning_brakes_check;

ALTER TABLE reconditioning 
ADD CONSTRAINT reconditioning_brakes_check 
CHECK (brakes IN ('acceptable', 'replaceFront', 'replaceRear', 'replaceAll', 'notSpecified'));

ALTER TABLE reconditioning 
DROP CONSTRAINT IF EXISTS reconditioning_tires_check;

ALTER TABLE reconditioning 
ADD CONSTRAINT reconditioning_tires_check 
CHECK (tires IN ('acceptable', 'replaceFront', 'replaceRear', 'replaceAll', 'notSpecified'));

ALTER TABLE reconditioning 
DROP CONSTRAINT IF EXISTS reconditioning_maintenance_check;

ALTER TABLE reconditioning 
ADD CONSTRAINT reconditioning_maintenance_check 
CHECK (maintenance IN ('upToDate', 'basicService', 'minorService', 'majorService', 'notSpecified'));