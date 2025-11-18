## Stripe Manual Testing Checklist (Staging)

### 1) Customer Portal uses correct customer ID
- Sign in as a test user that has an `accounts` row.
- Trigger `create-stripe-portal` (from `Subscription` UI).
- You should be redirected to the Stripe Billing Portal.
- In Stripe Dashboard → Customers, open the customer for this session and verify:
  - `metadata.account_id` matches your `accounts.id`.
  - The portal session belongs to that customer ID.

### 2) Customer creation on checkout
- Ensure `accounts.stripe_customer_id` is null for your test account.
- Start an upgrade via `create-stripe-checkout` (Connect or Annual plan).
- Complete checkout in Stripe test mode.
- Verify in DB that `accounts.stripe_customer_id` is now populated with the Stripe customer ID.

### 3) Webhook subscription updates
- After completing checkout, confirm webhook updates `accounts`:
  - `plan` becomes `connect` or `annual`.
  - `billing_status` becomes `active` or `trialing`.
- Cancel the subscription in Stripe test mode.
- Verify `plan` resets to `free` and `billing_status` becomes `canceled`.

### 4) Error handling
- Temporarily unset or set an invalid `STRIPE_SECRET_KEY` in staging to confirm functions return:
  - `{ error: 'Stripe not configured', code: 'STRIPE_CONFIG_MISSING' }` with HTTP 500.
- Call portal function without auth header to confirm 401 with `{ code: 'UNAUTHORIZED' }`.

