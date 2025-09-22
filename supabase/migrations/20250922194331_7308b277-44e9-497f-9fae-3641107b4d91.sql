-- Remove the foreign key constraint on profile_photo field
-- This allows storing full public URLs instead of just bucket IDs
ALTER TABLE buybidhq_users 
DROP CONSTRAINT IF EXISTS users_profile_photo_fkey;