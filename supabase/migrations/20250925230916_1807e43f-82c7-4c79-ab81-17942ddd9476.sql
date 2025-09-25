-- Update all users with 'associate' role to 'salesperson'
UPDATE buybidhq_users 
SET role = 'salesperson'::user_role 
WHERE role = 'associate'::user_role;