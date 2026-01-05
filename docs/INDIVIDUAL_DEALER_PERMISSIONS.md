# Individual Dealer Permissions & Features

## Overview

Individual dealers are **solo business owners** with full administrative control over their own account. Their permissions do NOT vary by payment plan (Beta/Connect/Annual) - **all individual dealers have the same admin capabilities**. The only difference between plans is **price visibility** and billing amount.

---

## Role & Permission Structure

### User Roles
- **UserRole**: `'basic'` (always, regardless of plan)
- **AppRole**: `'account_admin'` (always, regardless of plan)
- **Account Admin Entry**: ✅ Yes (always created)

### Key Concept
Individual dealers are **ALWAYS** account administrators because they're managing their own solo business. Payment plan affects billing and marketplace price visibility, NOT permissions.

---

## Payment Plans Comparison

| Feature | Beta (Free) | Connect ($99/mo) | Annual ($599/yr) |
|---------|------------|------------------|------------------|
| **Core Permissions** | | | |
| Manage own account | ✅ Yes | ✅ Yes | ✅ Yes |
| Create bid requests | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| Manage buyers | ✅ Yes | ✅ Yes | ✅ Yes |
| View marketplace | ✅ Yes | ✅ Yes | ✅ Yes |
| **Critical Difference** | | | |
| **See marketplace prices** | ❌ **NO** | ✅ **YES** | ✅ **YES** |
| **Billing** | | | |
| Monthly cost | $0 | $99 | ~$50 ($599/year) |
| Stripe integration | No | Yes | Yes |
| **Support** | | | |
| Email support | ✅ Yes | ✅ Yes | ✅ Yes |
| Priority support | ❌ No | ✅ Yes | ✅ Yes |
| **Other Features** | | | |
| Lifetime price lock | ❌ No | ✅ Yes | ✅ Yes |
| Future features | Standard | Early access | Early access |

---

## Detailed Permissions Matrix

### Dashboard Access

| Page/Feature | Beta | Connect | Annual | Implementation |
|--------------|------|---------|--------|----------------|
| **Dashboard** | ✅ | ✅ | ✅ | All users |
| View own statistics | ✅ | ✅ | ✅ | All account_admins |
| View activity feed | ✅ | ✅ | ✅ | All users |

### Bid Requests

| Action | Beta | Connect | Annual | Permission Check |
|--------|------|---------|--------|------------------|
| Create bid request | ✅ | ✅ | ✅ | `create_bid_requests` permission |
| Edit own bid request | ✅ | ✅ | ✅ | Owner or account_admin |
| Delete own bid request | ✅ | ✅ | ✅ | Owner or account_admin |
| View all own bids | ✅ | ✅ | ✅ | `view_account_data` permission |
| Invite buyers | ✅ | ✅ | ✅ | Bid request owner |
| Accept/decline offers | ✅ | ✅ | ✅ | Bid request owner |

### Marketplace

| Action | Beta | Connect | Annual | Implementation |
|--------|------|---------|--------|----------------|
| View listings | ✅ | ✅ | ✅ | All users |
| **See offer prices** | ❌ | ✅ | ✅ | `canUserSeePrices()` - plan check |
| View vehicle details | ✅ | ✅ | ✅ | All users |
| Filter/sort listings | ✅ | ✅ | ✅ | All users |
| Submit offers | ❌ | ❌ | ❌ | N/A (sellers only) |

**Critical**: Beta users see blurred prices (`$•••,•••`) with upgrade prompt.

### Buyers Management

| Action | Beta | Connect | Annual | Permission Check |
|--------|------|---------|--------|------------------|
| View all buyers | ✅ | ✅ | ✅ | `manage_all_buyers` permission |
| Add new buyer | ✅ | ✅ | ✅ | `manage_all_buyers` permission |
| Edit buyer | ✅ | ✅ | ✅ | `manage_all_buyers` permission |
| Delete/deactivate buyer | ✅ | ✅ | ✅ | `manage_all_buyers` permission |
| Import buyers | ✅ | ✅ | ✅ | `manage_all_buyers` permission |
| Export buyers | ✅ | ✅ | ✅ | `manage_all_buyers` permission |

### Account Settings

| Section | Beta | Connect | Annual | Notes |
|---------|------|---------|--------|-------|
| **Profile** | ✅ | ✅ | ✅ | All account_admins |
| Edit name/email | ✅ | ✅ | ✅ | Own profile |
| Edit phone number | ✅ | ✅ | ✅ | Own profile |
| Edit address | ✅ | ✅ | ✅ | Own profile |
| **Dealership** | ✅ | ✅ | ✅ | All account_admins |
| Edit business name | ✅ | ✅ | ✅ | account_admin only |
| Edit business info | ✅ | ✅ | ✅ | account_admin only |
| Edit license number | ✅ | ✅ | ✅ | account_admin only |
| **Subscription** | | | | |
| View plan | ✅ | ✅ | ✅ | All account_admins |
| Upgrade plan | ✅ | ✅ | ✅ | All account_admins |
| Manage payment methods | ❌ | ✅ | ✅ | Only paid plans |
| View billing history | ❌ | ✅ | ✅ | Only paid plans |
| Cancel subscription | ❌ | ✅ | ✅ | Only paid plans |
| **Security** | ✅ | ✅ | ✅ | All users |
| Change password | ✅ | ✅ | ✅ | All users |
| MFA settings | ✅ | ✅ | ✅ | All users |

### Navigation Menu

| Menu Item | Beta | Connect | Annual | Visibility Rule |
|-----------|------|---------|--------|-----------------|
| Dashboard | ✅ | ✅ | ✅ | All users |
| Bid Requests | ✅ | ✅ | ✅ | All users |
| Marketplace | ✅ | ✅ | ✅ | All users |
| Buyers | ✅ | ✅ | ✅ | All users |
| Users | ❌ | ❌ | ❌ | **Hidden** (no team members) |
| Account | ✅ | ✅ | ✅ | All users |
| Dealerships | ❌ | ❌ | ❌ | **Hidden** (super_admin only) |

**Note**: Individual dealers never see "Users" menu because they're solo (no team to manage).

---

## AppRole Permissions

Individual dealers have `app_role='account_admin'`, which grants:

```typescript
APP_ROLE_PERMISSIONS = {
  account_admin: [
    'view_account_data',
    'create_bid_requests',
    'manage_all_buyers',
    'manage_users',        // Not applicable (solo)
    'manage_billing'
  ]
}
```

### Permission Breakdown

| Permission | Description | Usage |
|------------|-------------|-------|
| `view_account_data` | View all data in their account | Dashboard, reports, all bids |
| `create_bid_requests` | Create new bid requests | Bid creation form |
| `manage_all_buyers` | Full buyer management | Add/edit/delete buyers |
| `manage_users` | Manage team members | **N/A** (individual dealers are solo) |
| `manage_billing` | Manage subscription/billing | Subscription tab, Stripe portal |

---

## Marketplace Price Visibility Logic

### Implementation

```typescript
// src/utils/planHelpers.ts
export const canUserSeePrices = (
  accountPlan: string | undefined,
  userRole?: string,
  userAppRole?: string
): boolean => {
  // Super admins can always see prices (system override)
  if (userAppRole === 'super_admin') {
    return true;
  }

  // All other users depend on plan:
  // - 'free' (beta) = NO
  // - 'connect' (monthly or annual) = YES
  return accountPlan !== 'free';
};
```

### Price Display

**Beta Users (plan='free'):**
```tsx
// Marketplace card shows blurred price
<div className="blur-sm">$•••,•••</div>
// With upgrade prompt
<UpgradeDialog message="Upgrade to see offer prices" />
```

**Connect/Annual Users (plan='connect'):**
```tsx
// Marketplace card shows actual price
<div>$25,500</div>
// Full price visibility
```

---

## Upgrade Flow

### Beta → Connect/Annual

When a beta user upgrades:

1. **Account update**:
   ```typescript
   UPDATE accounts
   SET plan = 'connect',
       billing_cycle = 'monthly' or 'annual',
       stripe_customer_id = '<stripe_id>',
       stripe_subscription_id = '<sub_id>',
       billing_status = 'active'
   WHERE id = <account_id>
   ```

2. **Immediate effects**:
   - ✅ Marketplace prices become visible
   - ✅ Stripe billing portal access
   - ✅ Priority support eligibility
   - ✅ Lifetime price lock guarantee

3. **Permissions remain the same**:
   - Still `role='basic'`, `app_role='account_admin'`
   - Still account administrator
   - Still manage all buyers
   - **Only difference**: can now see marketplace prices

---

## Key Differences vs. Dealership Users

| Aspect | Individual Dealer | Dealership User (Basic) | Dealership User (Individual) |
|--------|------------------|------------------------|----------------------------|
| **Solo vs. Team** | Solo only | Part of team | Part of team |
| **Role** | `basic` | `basic` | `individual` |
| **AppRole** | `account_admin` | `member` | `account_admin` |
| **Buyers** | Manage all | Own buyers only | Manage all |
| **Users** | N/A (solo) | Cannot manage | Can manage |
| **Billing** | Own subscription | N/A (account level) | N/A (account level) |
| **Price Visibility** | Plan-dependent | Plan-dependent | Plan-dependent |

---

## Summary

### Core Principles

1. **Individual dealers are ALWAYS account admins** regardless of payment plan
2. **Payment plan ONLY affects**:
   - Marketplace price visibility (Beta=NO, Connect/Annual=YES)
   - Billing amount ($0, $99/mo, $599/yr)
   - Support level
3. **Individual dealers are ALWAYS solo** - they cannot add team members
4. **Permissions do NOT change** when upgrading/downgrading plans

### Quick Reference

**What's the same across all plans?**
- ✅ Full account admin access
- ✅ Unlimited bid requests
- ✅ Full buyer management
- ✅ Account settings control

**What's different?**
- ❌ Beta: NO marketplace prices
- ✅ Connect/Annual: YES marketplace prices
- 💰 Billing amount varies

**What can't individual dealers do?**
- ❌ Add team members (they're solo)
- ❌ Access Users management page
- ❌ Access Dealerships admin page (super_admin only)
- ❌ See other accounts' data
