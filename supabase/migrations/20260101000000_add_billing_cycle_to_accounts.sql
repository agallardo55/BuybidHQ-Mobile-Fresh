-- Add billing_cycle column to accounts table
-- This distinguishes between monthly and annual billing for the same plan

ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly'
CHECK (billing_cycle IN ('monthly', 'annual'));

-- Add comment for documentation
COMMENT ON COLUMN public.accounts.billing_cycle IS 'Billing frequency: monthly ($99/mo) or annual ($599/yr)';

-- Update existing records to have monthly billing by default
UPDATE public.accounts
SET billing_cycle = 'monthly'
WHERE billing_cycle IS NULL;

-- Add index for faster queries filtering by billing cycle
CREATE INDEX IF NOT EXISTS idx_accounts_billing_cycle
ON public.accounts(billing_cycle);

-- Add composite index for plan and billing cycle
CREATE INDEX IF NOT EXISTS idx_accounts_plan_billing
ON public.accounts(plan, billing_cycle);
