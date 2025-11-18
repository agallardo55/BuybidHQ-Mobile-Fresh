# Stripe Checkout Testing Guide

## Overview
This guide covers testing both SignUp.tsx and SubscriptionSection.tsx components with Stripe checkout integration.

## Prerequisites
- Supabase project with Stripe secrets configured
- Production Stripe price IDs set up
- Test environment ready

## Environment Variables Required
```bash
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Current Stripe Configuration ✅
Based on `supabase secrets list`, the following are configured:
- `STRIPE_SECRET_KEY` ✅
- `STRIPE_CONNECT_PRICE_ID` ✅ 
- `STRIPE_ANNUAL_PRICE_ID` ✅
- `STRIPE_WEBHOOK_SIGNING_SECRET` ✅

## Testing Scenarios

### 1. SignUp.tsx Flow Testing

#### Test Case 1: Free Plan Signup
1. Navigate to `/signup`
2. Select "Free Beta Plan"
3. Complete personal information form
4. Submit signup
5. **Expected**: User created, redirected to dashboard (no Stripe checkout)

#### Test Case 2: Connect Plan Signup
1. Navigate to `/signup`
2. Select "Buybid Connect" plan
3. Complete personal information form
4. Submit signup
5. **Expected**: User created, redirected to Stripe checkout
6. Use test card: `4242 4242 4242 4242`
7. Complete checkout
8. **Expected**: Redirected back with success, account updated to 'connect' plan

#### Test Case 3: Annual Plan Signup
1. Navigate to `/signup`
2. Select "Annual Plan"
3. Complete personal information form
4. Submit signup
5. **Expected**: User created, redirected to Stripe checkout
6. Use test card: `4242 4242 4242 4242`
7. Complete checkout
8. **Expected**: Redirected back with success, account updated to 'annual' plan

### 2. SubscriptionSection.tsx Testing

#### Test Case 1: Free to Connect Upgrade
1. Sign in as user with 'free' plan
2. Navigate to Account → Subscription tab
3. Select "Connect Plan" radio button
4. Click "Upgrade to Connect Plan"
5. **Expected**: Redirected to Stripe checkout
6. Complete checkout with test card
7. **Expected**: Account plan updated to 'connect'

#### Test Case 2: Free to Annual Upgrade
1. Sign in as user with 'free' plan
2. Navigate to Account → Subscription tab
3. Select "Annual Plan" radio button
4. Click "Upgrade to Annual Plan"
5. **Expected**: Redirected to Stripe checkout
6. Complete checkout with test card
7. **Expected**: Account plan updated to 'annual'

#### Test Case 3: Connect to Annual Upgrade
1. Sign in as user with 'connect' plan
2. Navigate to Account → Subscription tab
3. Select "Annual Plan" radio button
4. Click "Upgrade to Annual Plan"
5. **Expected**: Redirected to Stripe checkout
6. Complete checkout with test card
7. **Expected**: Account plan updated to 'annual'

### 3. Error Scenarios Testing

#### Test Case 1: Payment Failure
1. Start any upgrade process
2. Use declined test card: `4000 0000 0000 0002`
3. **Expected**: Payment fails, user redirected to cancel URL

#### Test Case 2: Network Issues
1. Start upgrade process
2. Disconnect internet during checkout
3. **Expected**: Graceful error handling

#### Test Case 3: Invalid Plan Selection
1. Try to upgrade to non-existent plan
2. **Expected**: Error message displayed

## Test Cards for Stripe Testing

| Card Number | Description | Expected Result |
|-------------|-------------|-----------------|
| `4242 4242 4242 4242` | Visa (Success) | ✅ Payment succeeds |
| `4000 0000 0000 0002` | Generic decline | ❌ Payment declined |
| `4000 0000 0000 9995` | Insufficient funds | ❌ Payment declined |
| `4000 0000 0000 0069` | Expired card | ❌ Payment declined |
| `4000 0000 0000 0127` | CVC check fails | ❌ Payment declined |

## Database Verification

After successful checkout, verify these database updates:

```sql
-- Check account plan and billing status
SELECT id, plan, billing_status, stripe_customer_id, stripe_subscription_id 
FROM accounts 
WHERE id = 'your-account-id';

-- Check user-account relationship
SELECT u.id, u.email, a.plan, a.billing_status 
FROM buybidhq_users u 
JOIN accounts a ON u.account_id = a.id 
WHERE u.id = 'your-user-id';
```

## Expected Database Changes

### After Connect Plan Signup/Upgrade:
- `accounts.plan` = 'connect'
- `accounts.billing_status` = 'active' or 'trialing'
- `accounts.stripe_customer_id` = Stripe customer ID
- `accounts.stripe_subscription_id` = Stripe subscription ID

### After Annual Plan Signup/Upgrade:
- `accounts.plan` = 'annual'
- `accounts.billing_status` = 'active' or 'trialing'
- `accounts.stripe_customer_id` = Stripe customer ID
- `accounts.stripe_subscription_id` = Stripe subscription ID

## Function Testing

### Test create-stripe-checkout Function Directly:
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/create-stripe-checkout" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPlan": "free",
    "selectedPlan": "connect",
    "successUrl": "https://example.com/success",
    "cancelUrl": "https://example.com/cancel"
  }'
```

**Expected Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

## Issues Fixed ✅

1. **SubscriptionSection.tsx**: Fixed calling `test-simple` instead of `create-stripe-checkout`
2. **Stripe Configuration**: Verified production price IDs are configured
3. **Function Integration**: Both components now use the correct production function

## Next Steps

1. Run manual tests using this guide
2. Test with real Stripe test cards
3. Verify webhook processing (if webhooks are set up)
4. Test error scenarios
5. Verify database updates after successful payments

## Troubleshooting

### Common Issues:
1. **"Stripe not configured" error**: Check `STRIPE_SECRET_KEY` is set
2. **"Price ID not configured" error**: Check `STRIPE_CONNECT_PRICE_ID` and `STRIPE_ANNUAL_PRICE_ID` are set
3. **"Account not found" error**: Ensure user has linked account in `buybidhq_users` table
4. **Authentication errors**: Verify user is properly signed in

### Debug Steps:
1. Check Supabase function logs
2. Verify environment variables
3. Check database relationships
4. Test with curl commands
5. Use Stripe Dashboard to verify test payments
