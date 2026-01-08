# Toast Notifications Reference

Complete list of all toast notifications users see in the application, organized by category.

---

## Authentication & Session

### Sign In
- ❌ **Error:** "Please enter both email and password"
- ❌ **Error:** "Authentication failed"
- ❌ **Error:** "Failed to sign in"
- ❌ **Error:** `[Error message from Supabase]`

### Password Reset
- ✅ **Success:** "Your password has been successfully updated. Welcome back!"
- ❌ **Error:** "Passwords do not match."
- ❌ **Error:** "Failed to reset password. Please try again."
- ❌ **Error:** `[Password validation error]`

### Forgot Password
- ❌ **Error:** "Something went wrong. Please try again."

### Session Management
- ⚠️ **Warning:** "Your session will expire in 10 minutes. Please save any unsaved work."
- ❌ **Error:** "Session refresh failed. Please sign in again."

### Authorization
- ❌ **Error:** "You do not have access to this feature" (when user lacks required role)

---

## Subscription & Billing

### Checkout Success/Cancel
- ✅ **Success:** "Transaction Completed" / "Subscription updated successfully."
- ❌ **Cancelled:** "Transaction Cancelled" / "Subscription modification cancelled. Active plan: [plan name]"
- ❌ **Cancelled:** "Checkout Cancelled" / "Your subscription upgrade was cancelled. You're still on the [plan] plan. You can try upgrading again anytime from the Subscription tab."

---

## Buyers Management

### Add Buyer
- ✅ **Success:** "Buyer added successfully!"
- ❌ **Error:** "Failed to add buyer. Please try again."
- ❌ **Error:** "Failed to validate carrier. Please try again."
- ❌ **Error:** "An error occurred during carrier validation"

### Update Buyer
- ✅ **Success:** "Buyer updated successfully!"
- ❌ **Error:** "Failed to update buyer. Please try again."

### Delete Buyer
- ✅ **Success:** "Buyer deleted successfully!"
- ❌ **Error:** "Failed to delete buyer. Please try again."

### Fetch Buyers
- ❌ **Error:** "Failed to fetch buyers. Please try again."

---

## Dealership Management

### Create Dealership
- ✅ **Success:** "Dealership created successfully"
- ❌ **Error:** "Failed to create dealership"

### Update Dealership
- ✅ **Success:** "Dealership updated successfully"
- ❌ **Error:** "Failed to update dealership"

### Delete Dealership
- ✅ **Success:** "Dealership deleted successfully"
- ❌ **Error:** "Failed to delete dealership"

---

## Bid Requests

### Create Bid Request
- ✅ **Success:** "Bid request created successfully"
- ✅ **Success:** "Notification sent to all buyers" (when all notifications succeed)
- ❌ **Error:** "[Buyer name] was not sent successfully. Confirm the mobile number is correct." (for each failed buyer)
- ❌ **Error:** "User not found. Please try signing out and back in."
- ❌ **Error:** "Account not found. Please contact support."
- ❌ **Error:** "Failed to create bid request: [error message]"
- ❌ **Error:** "Failed to create bid request. Please try again."

### VIN Decoder
- ✅ **Success:** "Vehicle information retrieved successfully"
- ⚠️ **Warning:** "Trim data unavailable. Please select manually." / "You can still enter vehicle details using the dropdowns below."
- ❌ **Error:** "Something went wrong" / "Please try again with a US Vin Number 1990 or Newer vehicle."

### Update Bid Request Status
- ✅ **Success:** "Bid request status updated successfully"
- ❌ **Error:** "Failed to update bid request status"

### Delete Bid Request
- ✅ **Success:** "Bid request deleted successfully"
- ❌ **Error:** "Failed to delete bid request"

---

## Bid Responses (Offers)

### Submit Bid (Public Page)
- ✅ **Success:** "Bid submitted successfully!"
- ✅ **Success:** "Your bid has been submitted successfully!"
- ❌ **Error:** "Failed to submit bid: [error message]"
- ❌ **Error:** "Error: [error message]"

### Update Response Status
- ✅ **Success:** "Offer [accepted/declined]"
- ✅ **Success:** "Offer status updated successfully"
- ❌ **Error:** "Failed to update offer status"

---

## Profile & Account Settings

### Update Profile
- ✅ **Success:** "Profile updated successfully"
- ❌ **Error:** "Failed to update profile"

### Update Password
- ✅ **Success:** "Password updated successfully"
- ❌ **Error:** "Failed to update password"

### Update Mobile Number
- ✅ **Success:** "Mobile number updated successfully"
- ❌ **Error:** "Failed to update mobile number"

### Upload Avatar
- ✅ **Success:** "Avatar uploaded successfully"
- ❌ **Error:** "Failed to upload avatar"

---

## Notification Preferences

### Update Preferences
- ✅ **Success:** "Notification preferences updated successfully"
- ❌ **Error:** "Failed to update notification preferences"

---

## General Errors

### Global Error Handler
- ❌ **Error:** "Session expired. Please sign in again." (authentication errors)
- ❌ **Error:** "You don't have permission to perform this action" (permission errors)
- ❌ **Error:** "An unexpected error occurred" (unknown errors)
- ❌ **Error:** "Something went wrong" (generic fallback)

---

## Toast Configuration

**Location:** Bottom-right corner
**Duration:** 3 seconds (3000ms)
**Close Button:** Disabled (auto-dismiss only)
**Click to Dismiss:** Enabled (click anywhere outside)

**Variants:**
- ✅ **Success:** Green theme
- ❌ **Error/Destructive:** Red theme
- ⚠️ **Warning:** Yellow/Orange theme
- ℹ️ **Info/Default:** Blue theme

---

## Notes

1. Some toasts include **custom descriptions** for additional context
2. Error messages from **Supabase** are passed through directly when available
3. **Authentication errors** automatically redirect users to `/signin`
4. **Buyer notifications** show individual success/error per buyer when sending bid requests
5. All toasts **auto-dismiss** after 3 seconds unless click-away happens first
