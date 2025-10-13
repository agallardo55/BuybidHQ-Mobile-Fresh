-- Add 'annual' to the accounts plan CHECK constraint
-- This allows the annual plan to be stored in the database

-- Drop the existing constraint
ALTER TABLE public.accounts 
DROP CONSTRAINT IF EXISTS accounts_plan_check;

-- Add the new constraint with 'annual' included
ALTER TABLE public.accounts 
ADD CONSTRAINT accounts_plan_check 
CHECK (plan IN ('free', 'connect', 'annual', 'group'));

