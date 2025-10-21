# Admin Access Debugging Guide

## Problem Summary

A user is showing as having admin access when they should be a free member. This is likely due to legacy admin role assignments that haven't been properly cleaned up during system migrations.

## Root Cause Analysis

The admin access determination in BuyBidHQ uses multiple sources, creating potential for inconsistent role assignments:

### 1. Legacy Role System
- **`buybidhq_users.role`** field: If set to `'admin'`, user is considered admin
- **Legacy `superadmin` table**: Email-based admin assignments
- **`is_superadmin(user_email)` function**: Checks legacy superadmin table

### 2. New Role System  
- **`super_administrators` table**: User ID-based super admin assignments
- **`account_administrators` table**: Account-level admin assignments
- **`user_roles` table**: Granular role management
- **`is_super_admin(user_id)` function**: Checks new super_administrators table

### 3. Admin Detection Logic

The `get_current_user_data()` function determines admin status using:
```sql
(u.role = 'admin' OR EXISTS (SELECT 1 FROM super_administrators WHERE user_id = u.id AND status = 'active')) as is_admin
```

The `useCurrentUser` hook calls `is_superadmin(user_email)` which checks the legacy `superadmin` table.

## Common Issues

1. **Legacy Role Field**: User has `buybidhq_users.role = 'admin'` from old system
2. **Legacy Superadmin Entry**: User exists in `superadmin` table with `status = 'active'`
3. **Incorrect Migration**: User was migrated to new admin tables when they should be free members
4. **Multiple Admin Sources**: User has admin access from multiple sources

## Debugging Tools

### 1. JavaScript Debug Script
```bash
node debug-admin-access.js <user_email>
```

This script will:
- Check all admin-related tables
- Test all admin detection functions
- Identify the source of admin access
- Provide specific recommendations

### 2. SQL Debug Script
```sql
-- Replace 'USER_EMAIL_HERE' with actual email
\set user_email 'USER_EMAIL_HERE'
\i fix-admin-access.sql
```

This script will:
- Show current admin status from all sources
- Test admin detection functions
- Provide SQL commands to fix the issue

## Solution Steps

### Step 1: Identify the Issue
Run the debug script to identify which tables/sources are causing admin access:

```bash
node debug-admin-access.js user@example.com
```

### Step 2: Fix the Root Cause

Based on the debug output, apply the appropriate fixes:

#### Fix Legacy Role Field
```sql
UPDATE buybidhq_users 
SET 
  role = 'basic',
  app_role = 'member',
  updated_at = NOW()
WHERE email = 'user@example.com'
AND role = 'admin';
```

#### Remove from Legacy Superadmin Table
```sql
DELETE FROM superadmin 
WHERE email = 'user@example.com';
```

#### Remove from New Admin Tables
```sql
-- Remove from super_administrators
DELETE FROM super_administrators 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);

-- Remove from account_administrators
DELETE FROM account_administrators 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

#### Fix User Roles Table
```sql
-- Remove admin roles
DELETE FROM user_roles 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
)
AND role IN ('super_admin', 'account_admin', 'manager');

-- Add member role
INSERT INTO user_roles (user_id, role, granted_at, is_active)
SELECT 
  au.id,
  'member',
  NOW(),
  true
FROM auth.users au
WHERE au.email = 'user@example.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = au.id AND ur.role = 'member'
);
```

### Step 3: Verify the Fix
Run the debug script again to confirm admin access has been removed:

```bash
node debug-admin-access.js user@example.com
```

All admin detection functions should return `false`.

## Prevention

To prevent this issue in the future:

1. **Audit Admin Assignments**: Regularly check who has admin access
2. **Clean Migration Process**: Ensure proper role mapping during migrations
3. **Role Validation**: Add validation to prevent incorrect role assignments
4. **Monitoring**: Set up alerts for unexpected admin access changes

## Files Created

- `debug-admin-access.js` - JavaScript debugging script
- `fix-admin-access.sql` - SQL debugging and fixing script
- `ADMIN_ACCESS_DEBUG_GUIDE.md` - This documentation

## Testing

After applying fixes, test the user's access:

1. **Login**: User should be able to login normally
2. **UI Check**: Subscription page should show correct plan (Free Plan)
3. **Functionality**: User should have appropriate permissions for their plan
4. **Admin Functions**: All admin detection functions should return `false`

## Related Code

- `src/hooks/useCurrentUser.ts` - Main user data hook
- `src/contexts/AuthContext.tsx` - Authentication context
- `supabase/migrations/20250926014543_*.sql` - get_current_user_data function
- `supabase/migrations/20250926013800_*.sql` - is_superadmin function
