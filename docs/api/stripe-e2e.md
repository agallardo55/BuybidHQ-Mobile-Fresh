## Stripe E2E (Phase 3)

### CI setup
- Add repo secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_CONNECT_PRICE_ID`, `STRIPE_ANNUAL_PRICE_ID`, `TEST_EMAIL_DOMAIN`.
- Workflow file: `.github/workflows/stripe-e2e.yml` runs on push/PR to `staging`.

### Local run
```bash
SUPABASE_URL=... \
SUPABASE_ANON_KEY=... \
SUPABASE_SERVICE_ROLE_KEY=... \
STRIPE_SECRET_KEY=... \
STRIPE_CONNECT_PRICE_ID=price_xxx \
STRIPE_ANNUAL_PRICE_ID=price_yyy \
node scripts/stripe-e2e/runner.mjs
```

### What it validates
- Signup → Checkout invocation (ensures Stripe customer) → Webhook updates account to `connect` when subscription is created.
- Upgrade `connect` → `annual` via Stripe; webhook updates account.
- Failed payment scenario via Stripe test PaymentMethod `pm_card_chargeDeclined`.
- Cancellation downgrades to `free` and sets `billing_status` to `canceled`.

