# Testing Onboarding Toast

## Current Status
Your profile shows as 100% complete, which is why the toast doesn't show.

## To Test the Toast:

### Option 1: Temporarily Remove a Field
1. Go to `/account?tab=personal`
2. Clear one field (like Address or City)
3. Click Save
4. Navigate back to `/dashboard`
5. Toast should appear after 2 seconds

### Option 2: Use Browser Console to Simulate
Run this in the browser console to see what fields are checked:
```javascript
// Paste this in console while on dashboard
sessionStorage.clear();
location.reload();
```

### Option 3: Force Show for Testing
Add this temporary code to OnboardingToast.tsx line 89:
```typescript
// TEMPORARY: Force show for testing
if (profileCompletion.percentage >= 100) {
  console.log('🎯 OnboardingToast: Profile 100% complete, but showing anyway for testing');
  // Don't return - let it show anyway
  // return; // Comment this out
}
```

## What the Toast Checks
The toast requires these 10 fields to be filled:
1. ✅ Role
2. ✅ Full Name
3. ✅ Email
4. ✅ Mobile Number
5. ✅ Dealer Name
6. ✅ License Number
7. ✅ Address
8. ✅ City
9. ✅ State
10. ✅ ZIP Code

If ALL are filled → Toast hidden (profile complete!)
If ANY are missing → Toast shows
