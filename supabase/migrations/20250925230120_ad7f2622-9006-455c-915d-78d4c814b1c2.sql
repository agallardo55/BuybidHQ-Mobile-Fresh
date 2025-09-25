-- Update existing users with basic and individual roles to member
UPDATE buybidhq_users 
SET app_role = 'member' 
WHERE app_role IN ('basic', 'individual') OR role IN ('basic', 'individual');