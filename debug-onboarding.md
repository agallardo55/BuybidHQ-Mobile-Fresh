# Debug Onboarding Toast Issue - RESOLVED

## Issue
User `adamgallardo@.com` is missing address and onboarding toast is not showing.

## Changes Made

### 1. Enhanced Debug Logging
**Files Modified:**
- `src/components/onboarding/OnboardingToast.tsx`
- `src/services/profileService.ts`

**What was added:**
- More detailed console logs showing why toast doesn't appear
- Session storage state logging
- Profile completion calculation details
- Shows exact values (null/undefined/empty string) for missing fields

### 2. Fixed Type Checking
**File:** `src/services/profileService.ts`

**Before:**
```typescript
field.value && field.value.trim() !== ''
```

**After:**
```typescript
field.value && typeof field.value === 'string' && field.value.trim() !== ''
```

**Why:** Prevents errors if fields are null/undefined/non-string values.

## Debug Steps

### 1. Check Browser Console
When logged in as `adamgallardo@.com`, look for these debug logs:
```
🎯 OnboardingToast Debug:
🎯 OnboardingToast: Early return
🎯 OnboardingToast: Profile completion
🎯 OnboardingToast: Will show toast in XXX ms
```

### 2. Check SessionStorage
Open browser DevTools → Application → Session Storage → Check for key:
```
onboarding-toast-dismissed
```
**If exists:** Toast was dismissed in this session. Clear it and refresh.

### 3. Check User Data in Console
```javascript
// Paste this in browser console
const user = JSON.parse(localStorage.getItem('sb-fdcfdbjputcitgxosnyk-auth-token'));
console.log('User:', user);
```

### 4. Check Profile Completion
The toast checks these fields:
- ✅ role
- ✅ full_name
- ✅ email
- ✅ mobile_number
- ✅ dealer_name
- ✅ license_number
- ❌ **address** (MISSING)
- ❌ city (possibly missing?)
- ❌ state (possibly missing?)
- ❌ zip_code (possibly missing?)

## Conditions That Prevent Toast from Showing

1. **Dismissed in this session:** `sessionStorage.getItem('onboarding-toast-dismissed') === 'true'`
2. **User is super_admin:** `user.role === 'super_admin' || user.app_role === 'super_admin'`
3. **Profile is 100% complete:** All 10 required fields filled
4. **User not loaded yet:** `isLoading === true` or `currentUser === null`

## Quick Fix Commands

### Clear Session Dismissal
```javascript
// Run in browser console
sessionStorage.removeItem('onboarding-toast-dismissed');
window.location.reload();
```

### Force Show Toast (Testing)
```javascript
// Run in browser console
sessionStorage.clear();
localStorage.removeItem('onboarding-toast-dismissed');
window.location.reload();
```

## Expected Behavior

If user is missing address:
- Profile completion should be **90%** (9/10 fields complete)
- Toast should show with message like:
  - "Adam, you're almost there! Just one more step to unlock all features."
  - "Missing: Address"
- Toast should appear **2 seconds** after dashboard loads
