-- Fix account association for Adam Gallardo
-- Associate user with existing "Adam Gallardo's Account"
UPDATE buybidhq_users 
SET account_id = '050af127-0480-4721-ad79-b3ddd22d161f'
WHERE email = 'adam@gallardopanel.com' AND account_id IS NULL;