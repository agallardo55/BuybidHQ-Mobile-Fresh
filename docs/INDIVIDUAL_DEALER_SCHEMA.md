# Individual Dealer Schema Documentation

## Overview

Individual dealers are **solo business owners** who sign up for Beta (free), Connect (monthly), or Annual (yearly) plans. They manage their own account without team members.

---

## Database Tables

### `individual_dealers` Table

Stores business information for individual dealer accounts.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `user_id` | UUID | No | Foreign key to `buybidhq_users` (one-to-one) |
| `business_name` | TEXT | No | Dealership/business name |
| `business_email` | TEXT | No | Business email address |
| `business_phone` | TEXT | Yes | Business phone number (optional) |
| `license_number` | TEXT | Yes | Dealer license number (optional) |
| `address` | TEXT | Yes | Business street address |
| `city` | TEXT | Yes | Business city |
| `state` | TEXT | Yes | Business state |
| `zip_code` | TEXT | Yes | Business ZIP code |
| `created_at` | TIMESTAMP | Yes | Record creation timestamp |
| `updated_at` | TIMESTAMP | Yes | Last update timestamp |

**Key Constraints:**
- `user_id` is UNIQUE (one user = one individual dealer)
- `business_email` is REQUIRED
- `business_name` is REQUIRED

---

### `buybidhq_users` Table (Individual Dealer Record)

| Field | Value for Individual Dealers | Notes |
|-------|------------------------------|-------|
| `id` | UUID | Matches auth.users.id |
| `email` | User's email | From signup form |
| `full_name` | User's name | From signup form |
| `mobile_number` | User's mobile | From signup form |
| `role` | `'basic'` | **Always 'basic' for individual dealers** |
| `app_role` | `'account_admin'` | **Always 'account_admin' - they manage their own account** |
| `account_id` | UUID | Links to `accounts` table |
| `dealership_id` | `NULL` | **Individual dealers don't use dealerships table** |
| `is_active` | `true` | Account is active |
| `status` | `'active'` | User status |

**Key Points:**
- Individual dealers **always** get `role='basic'` and `app_role='account_admin'`
- They do NOT have a `dealership_id` (that's for multi-user dealerships)
- The link is via `individual_dealers.user_id`

---

### `accounts` Table (Payment Plans)

| Field | Value | Description |
|-------|-------|-------------|
| `id` | UUID | Account ID |
| `name` | Business name | From signup |
| `plan` | `'free'` or `'connect'` | **Beta→'free', Connect/Annual→'connect'** |
| `billing_cycle` | `'monthly'` or `'annual'` or `NULL` | NULL for free, monthly/annual for paid |
| `billing_status` | `'active'`, `'past_due'`, etc. | Stripe webhook updates |
| `seat_limit` | `1` | Individual dealers = 1 seat |
| `stripe_customer_id` | TEXT | Stripe customer ID (NULL for free) |
| `stripe_subscription_id` | TEXT | Stripe subscription ID (NULL for free) |
| `feature_group_enabled` | BOOLEAN | Future dealership features |

**Plan Mapping:**
```
Frontend Plan → Database Plan → Billing Cycle
-------------------------------------------------
Beta (Free)   → 'free'        → NULL
Connect       → 'connect'     → 'monthly'
Annual        → 'connect'     → 'annual'
```

---

### `account_administrators` Table

Individual dealers **always** get an entry in this table since they're the admin of their own account.

| Field | Value | Notes |
|-------|-------|-------|
| `user_id` | UUID | Links to buybidhq_users.id |
| `account_id` | UUID | Links to accounts.id |
| `email` | User's email | |
| `full_name` | User's name | |
| `mobile_number` | User's mobile | |
| `status` | `'active'` | Admin status |
| `granted_by` | Same as user_id | Self-granted during signup |
| `granted_at` | Timestamp | When admin access granted |

---

## Payment Plans & Permissions

| Plan | Price | Price Visibility | Features |
|------|-------|------------------|----------|
| **Beta (Free)** | $0/month | ❌ **NO** - must upgrade | Unlimited bid requests, Basic buyers management, Email support |
| **Connect (Monthly)** | $99/month | ✅ **YES** | Marketplace price visibility, All Beta features, Priority support, Lifetime price lock |
| **Annual (Yearly)** | $599/year | ✅ **YES** | Same as Connect, ~$50/month savings |

**Key Rule:** Beta (free) users **cannot see marketplace prices** - they must upgrade to Connect or Annual.

---

## Signup Flow

### Step 1: Auth User Creation
```typescript
// Supabase Auth creates user in auth.users table
const { data: authData } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password
});
```

### Step 2: Create buybidhq_users Record
```typescript
await supabase.from('buybidhq_users').insert({
  id: authData.user.id,
  email: formData.email,
  full_name: formData.fullName,
  mobile_number: formData.mobileNumber,
  role: 'basic',              // Always 'basic' for individual dealers
  app_role: 'member',         // Initially 'member', updated to 'account_admin' later
  is_active: true,
  status: 'active'
});
```

### Step 3: Create individual_dealers Record
```typescript
await supabase.from('individual_dealers').upsert({
  user_id: authData.user.id,
  business_name: formData.dealershipName,
  business_email: formData.email,
  business_phone: formData.mobileNumber
});
```

### Step 4: Update to account_admin
```typescript
await supabase.from('buybidhq_users').update({
  app_role: 'account_admin'  // Solo users are admins of their own account
}).eq('id', authData.user.id);
```

### Step 5: Create Account
```typescript
// Account with plan based on selection
await supabase.from('accounts').insert({
  name: formData.dealershipName,
  plan: mapPlanToDB(formData.plan),  // beta-access→'free', connect/annual→'connect'
  billing_cycle: mapBillingCycle(formData.plan),
  seat_limit: 1
});
```

### Step 6: Create account_administrators Entry
```typescript
await supabase.from('account_administrators').insert({
  user_id: authData.user.id,
  account_id: accountId,
  email: formData.email,
  full_name: formData.fullName,
  mobile_number: formData.mobileNumber,
  status: 'active',
  granted_by: authData.user.id,
  granted_at: new Date().toISOString()
});
```

---

## Schema Review Findings

### ✅ What's Correct

1. **Clean separation**: `individual_dealers` table properly separated from `dealerships` table
2. **One-to-one relationship**: `user_id` is unique, enforcing solo business model
3. **Required fields**: `business_name` and `business_email` are required
4. **Role assignment**: Always `role='basic'` + `app_role='account_admin'`
5. **No dealership_id**: Individual dealers correctly have `dealership_id=NULL`

### ⚠️ Potential Issues

1. **Address fields are nullable**: Business address fields (address, city, state, zip_code) are optional
   - Consider if these should be required for business verification
   - Currently signup doesn't collect address during initial registration

2. **business_phone is nullable**: Phone number is optional
   - User provides mobile_number in buybidhq_users, but business_phone in individual_dealers can differ
   - Currently signup uses same number for both

3. **license_number is nullable**: Dealer license is optional
   - Consider if this should be required for regulatory compliance
   - Not collected during signup currently

### 💡 Recommendations

1. **Keep current schema** - It's working well and flexible
2. **Address collection** - Consider adding optional business address collection to signup flow
3. **License number** - Add optional license number field to account settings for future verification
4. **Validation** - Business email validation during signup to prevent typos

---

## Key Differences: Individual Dealers vs Dealerships

| Aspect | Individual Dealers | Dealerships (Multi-user) |
|--------|-------------------|-------------------------|
| **Table** | `individual_dealers` | `dealerships` |
| **User Count** | 1 user only | Multiple users (team) |
| **Role** | Always `'basic'` | Varies (`basic`, `individual`, `associate`, `admin`) |
| **AppRole** | Always `'account_admin'` | Varies (`member`, `account_admin`) |
| **Billing** | Individual subscription | Team/group subscription (future) |
| **Use Case** | Solo dealer managing own business | Dealership with multiple team members |

---

## Summary

The individual_dealers schema is **well-designed and clean**. It properly represents solo business owners who:
- Manage their own account (`app_role='account_admin'`)
- Don't have team members (one-to-one with user)
- Have payment plans (Beta/Connect/Annual) that don't affect their admin status
- Cannot see marketplace prices on Beta plan (must upgrade)

**No schema changes needed** at this time. The structure is sound and ready for use.
