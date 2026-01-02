-- Add performance indexes for frequently queried foreign keys
-- These will significantly improve query performance as data grows

-- Index for users' account lookup (used in RLS policies)
CREATE INDEX IF NOT EXISTS idx_users_account_id
ON public.buybidhq_users(account_id)
WHERE account_id IS NOT NULL;

-- Index for bid requests by account (used in dashboard queries)
CREATE INDEX IF NOT EXISTS idx_bid_requests_account_id
ON public.bid_requests(account_id)
WHERE account_id IS NOT NULL;

-- Index for buyers by account (used in buyer management)
CREATE INDEX IF NOT EXISTS idx_buyers_account_id
ON public.buyers(account_id)
WHERE account_id IS NOT NULL;

-- Index for buyers by owner (used in Group plan manager queries)
CREATE INDEX IF NOT EXISTS idx_buyers_owner_user_id
ON public.buyers(owner_user_id)
WHERE owner_user_id IS NOT NULL;

-- Index for subscriptions by user (used in billing lookups)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
ON public.subscriptions(user_id);

-- Index for subscriptions by Stripe subscription ID (used in webhook handlers)
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
ON public.subscriptions(stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

-- Index for subscriptions by Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id
ON public.subscriptions(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- Index for accounts by Stripe customer ID (used in payment flow)
CREATE INDEX IF NOT EXISTS idx_accounts_stripe_customer_id
ON public.accounts(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- Index for accounts by Stripe subscription ID
CREATE INDEX IF NOT EXISTS idx_accounts_stripe_subscription_id
ON public.accounts(stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

-- Composite index for bid requests by account and creation date (dashboard sorting)
CREATE INDEX IF NOT EXISTS idx_bid_requests_account_created
ON public.bid_requests(account_id, created_at DESC)
WHERE account_id IS NOT NULL;

-- Composite index for bid requests by account and status (filtering)
CREATE INDEX IF NOT EXISTS idx_bid_requests_account_status
ON public.bid_requests(account_id, status)
WHERE account_id IS NOT NULL;

-- Index for users by email (login lookups)
CREATE INDEX IF NOT EXISTS idx_users_email
ON public.buybidhq_users(email);

-- Index for users by role (admin queries)
CREATE INDEX IF NOT EXISTS idx_users_role
ON public.buybidhq_users(role);

-- Index for users by app_role (permission checks)
CREATE INDEX IF NOT EXISTS idx_users_app_role
ON public.buybidhq_users(app_role);

-- Index for active users
CREATE INDEX IF NOT EXISTS idx_users_is_active
ON public.buybidhq_users(is_active)
WHERE is_active = true;

-- Add comments for documentation
COMMENT ON INDEX idx_users_account_id IS 'Improves RLS policy performance for account-based queries';
COMMENT ON INDEX idx_bid_requests_account_id IS 'Speeds up dashboard bid request queries';
COMMENT ON INDEX idx_buyers_account_id IS 'Optimizes buyer management queries';
COMMENT ON INDEX idx_subscriptions_stripe_subscription_id IS 'Essential for Stripe webhook lookups';
