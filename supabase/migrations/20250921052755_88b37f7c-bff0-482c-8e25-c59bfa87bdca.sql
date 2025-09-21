-- Create accounts table for tenant-based subscriptions
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'connect', 'group')),
  seat_limit INT NOT NULL DEFAULT 1,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  billing_status TEXT DEFAULT 'active',
  feature_group_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS to accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Add columns to buybidhq_users for new role system
ALTER TABLE public.buybidhq_users 
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS app_role TEXT NOT NULL DEFAULT 'member' CHECK (app_role IN ('member', 'manager', 'account_admin', 'super_admin'));

-- Add account_id to bid_requests
ALTER TABLE public.bid_requests 
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;

-- Add account_id and owner_user_id to buyers
ALTER TABLE public.buyers 
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create helper functions for RLS
CREATE OR REPLACE FUNCTION public.current_user_in_account(a_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.buybidhq_users u
    WHERE u.id = auth.uid() AND u.account_id = a_id
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE SQL STABLE AS $$
  SELECT app_role FROM public.buybidhq_users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_account_id()
RETURNS UUID LANGUAGE SQL STABLE AS $$
  SELECT account_id FROM public.buybidhq_users WHERE id = auth.uid();
$$;

-- Migration: Create accounts for existing users and migrate data
INSERT INTO public.accounts (id, name, plan, seat_limit, stripe_customer_id, stripe_subscription_id, billing_status)
SELECT 
  gen_random_uuid() as id,
  COALESCE(u.full_name, 'Account') || '''s Account' as name,
  CASE 
    WHEN s.plan_type = 'beta-access' THEN 'free'
    WHEN s.plan_type IN ('individual', 'pay-per-bid') THEN 'connect'
    WHEN s.plan_type = 'dealership' THEN 'group'
    ELSE 'free'
  END as plan,
  CASE 
    WHEN s.plan_type = 'dealership' THEN 10
    ELSE 1
  END as seat_limit,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  s.status as billing_status
FROM public.buybidhq_users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
WHERE u.role IN ('admin', 'individual', 'dealer') -- Account owners
ON CONFLICT DO NOTHING;

-- Update buybidhq_users with account_id and new roles
UPDATE public.buybidhq_users SET 
  account_id = (
    SELECT a.id FROM public.accounts a
    LEFT JOIN public.subscriptions s ON s.stripe_customer_id = a.stripe_customer_id
    WHERE s.user_id = buybidhq_users.id OR (s.user_id IS NULL AND buybidhq_users.role = 'admin')
    LIMIT 1
  ),
  app_role = CASE 
    WHEN role = 'admin' THEN 'super_admin'
    WHEN role IN ('basic', 'associate') THEN 'member'
    WHEN role IN ('individual', 'dealer') THEN 'account_admin'
    ELSE 'member'
  END;

-- For users without accounts (associates, basics), assign them to their dealership's account
UPDATE public.buybidhq_users SET 
  account_id = (
    SELECT d_user.account_id 
    FROM public.buybidhq_users d_user 
    WHERE d_user.dealership_id = buybidhq_users.dealership_id 
    AND d_user.app_role = 'account_admin'
    LIMIT 1
  )
WHERE account_id IS NULL AND dealership_id IS NOT NULL;

-- Update bid_requests with account_id
UPDATE public.bid_requests SET 
  account_id = (
    SELECT u.account_id FROM public.buybidhq_users u WHERE u.id = bid_requests.user_id
  );

-- Update buyers with account_id and owner_user_id
UPDATE public.buyers SET 
  account_id = (
    SELECT u.account_id FROM public.buybidhq_users u WHERE u.id = buyers.user_id
  ),
  owner_user_id = user_id;

-- RLS Policies for accounts
CREATE POLICY "Users can view their own account"
ON public.accounts FOR SELECT
USING (current_user_in_account(id) OR current_user_role() = 'super_admin');

CREATE POLICY "Account admins can update their account"
ON public.accounts FOR UPDATE
USING (
  (current_user_in_account(id) AND current_user_role() IN ('account_admin', 'super_admin'))
);

-- Updated RLS for bid_requests (account-scoped)
DROP POLICY IF EXISTS "Admin full access to bid requests" ON public.bid_requests;
DROP POLICY IF EXISTS "Basic and individual users can manage their own bid requests" ON public.bid_requests;

CREATE POLICY "Account users can read bid requests"
ON public.bid_requests FOR SELECT
USING (current_user_in_account(account_id) OR current_user_role() = 'super_admin');

CREATE POLICY "Account users can create bid requests"
ON public.bid_requests FOR INSERT
WITH CHECK (current_user_in_account(account_id) OR current_user_role() = 'super_admin');

CREATE POLICY "Account users can update bid requests"
ON public.bid_requests FOR UPDATE
USING (current_user_in_account(account_id) OR current_user_role() = 'super_admin');

-- Updated RLS for buyers (with Group plan nuances)
DROP POLICY IF EXISTS "Basic and individual users can manage their own buyers" ON public.buyers;
DROP POLICY IF EXISTS "Dealers can manage all dealership buyers" ON public.buyers;

CREATE POLICY "Buyers read within account"
ON public.buyers FOR SELECT
USING (
  current_user_in_account(account_id) AND (
    -- If Group + manager => only own buyers
    (
      (SELECT plan FROM public.accounts a WHERE a.id = buyers.account_id) = 'group'
      AND current_user_role() = 'manager'
      AND buyers.owner_user_id = auth.uid()
    )
    -- Otherwise (Free/Connect or admin in Group) => full account access
    OR (
      (SELECT plan FROM public.accounts a WHERE a.id = buyers.account_id) IN ('free','connect')
      OR current_user_role() IN ('account_admin','super_admin')
    )
  )
);

CREATE POLICY "Buyers write within rules"
ON public.buyers FOR ALL
USING (
  current_user_in_account(account_id) AND (
    -- Group managers: only their own rows
    (
      (SELECT plan FROM public.accounts a WHERE a.id = buyers.account_id) = 'group'
      AND current_user_role() = 'manager'
      AND buyers.owner_user_id = auth.uid()
    )
    -- Account admin/super admin: full control
    OR current_user_role() IN ('account_admin','super_admin')
    -- Free/Connect members: can manage all buyers in their account
    OR (
      (SELECT plan FROM public.accounts a WHERE a.id = buyers.account_id) IN ('free','connect')
      AND current_user_role() IN ('member','account_admin')
    )
  )
)
WITH CHECK (
  -- Enforce correct owner on insert/update for managers
  (
    current_user_role() = 'manager'
    AND (SELECT plan FROM public.accounts a WHERE a.id = buyers.account_id) = 'group'
    AND owner_user_id = auth.uid()
  )
  OR current_user_role() IN ('account_admin','super_admin')
  OR (
    (SELECT plan FROM public.accounts a WHERE a.id = buyers.account_id) IN ('free','connect')
    AND current_user_role() IN ('member','account_admin')
  )
);

-- Function to check bid creation limits
CREATE OR REPLACE FUNCTION public.can_create_bid_request(user_id UUID)
RETURNS JSONB LANGUAGE PLPGSQL STABLE AS $$
DECLARE
  user_account_id UUID;
  account_plan TEXT;
  monthly_count INTEGER;
  month_start TIMESTAMPTZ;
BEGIN
  -- Get user's account info
  SELECT u.account_id, a.plan INTO user_account_id, account_plan
  FROM public.buybidhq_users u
  JOIN public.accounts a ON a.id = u.account_id
  WHERE u.id = user_id;
  
  -- If not free plan, unlimited
  IF account_plan != 'free' THEN
    RETURN jsonb_build_object('allowed', true);
  END IF;
  
  -- Check monthly limit for free plan
  month_start := date_trunc('month', now());
  
  SELECT COUNT(*) INTO monthly_count
  FROM public.bid_requests
  WHERE account_id = user_account_id
  AND created_at >= month_start;
  
  IF monthly_count < 10 THEN
    RETURN jsonb_build_object('allowed', true, 'remaining', 10 - monthly_count);
  ELSE
    RETURN jsonb_build_object('allowed', false, 'reason', 'FREE_LIMIT_REACHED');
  END IF;
END;
$$;

-- Trigger to update accounts updated_at
CREATE OR REPLACE FUNCTION public.update_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accounts_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_accounts_updated_at();