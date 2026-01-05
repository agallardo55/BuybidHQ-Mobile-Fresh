# MFA Code Sending: Auto First, Manual Rest

## Rule

**First code on sign-in**: Automatic (current behavior)
**All subsequent codes**: Manual (user must click Resend)

## Why

- First code = good UX (user expects it)
- Subsequent codes = cost control (prevents waste from refreshes, abandonments, multiple tabs)

## Cost Impact

**Current**: Users can trigger unlimited auto-sends via refresh/navigation
**New**: Only 1 auto-send per sign-in session, rest are manual

**Estimated Savings**: $300-500/year (prevents 80% of wasted resends)

---

## Implementation

### 1. Track Sign-In Context

Add flag to distinguish initial sign-in vs. subsequent page loads:

```typescript
// SignIn.tsx - After successful auth, before MFA redirect
if (mfaNeeded === true) {
  navigate('/auth/mfa-challenge', {
    state: {
      from: { pathname: from },
      isInitialSignIn: true  // ← NEW FLAG
    },
    replace: true
  });
}
```

### 2. Update MFAChallenge Component

```typescript
// MFAChallenge.tsx

const location = useLocation();
const isInitialSignIn = location.state?.isInitialSignIn || false;

useEffect(() => {
  const initMFA = async () => {
    // Only auto-send on INITIAL sign-in
    if (!isInitialSignIn) {
      setCodeSendState('not_sent'); // Show "Send Code" button
      return;
    }

    // Check if already sent in this session
    if (hasSentCodeRef.current) return;

    const sessionKey = 'mfa_code_sent_timestamp';
    const lastSentTime = sessionStorage.getItem(sessionKey);
    const now = Date.now();

    if (lastSentTime && (now - parseInt(lastSentTime)) < 60 * 1000) {
      hasSentCodeRef.current = true;
      setCodeSent(true);
      return;
    }

    // Auto-send ONLY on initial sign-in
    hasSentCodeRef.current = true;
    await handleSendCode();
    sessionStorage.setItem(sessionKey, now.toString());
  };

  initMFA();
}, [isInitialSignIn]);
```

### 3. Update ProtectedRoute

```typescript
// ProtectedRoute.tsx - When redirecting to MFA

if (needsMFA) {
  return <Navigate
    to="/auth/mfa-challenge"
    state={{
      from: location,
      isInitialSignIn: false  // ← NOT initial sign-in
    }}
    replace
  />;
}
```

### 4. UI State Handling

```typescript
const [codeSendState, setCodeSendState] = useState<'not_sent' | 'sent'>('sent');

// Show "Send Code" button if not initial sign-in and code not sent
if (codeSendState === 'not_sent') {
  return (
    <div>
      <h2>Verification Code Expired or Not Sent</h2>
      <p>Click below to receive a new code</p>
      <Button onClick={handleSendCode}>
        Send Verification Code
      </Button>
    </div>
  );
}

// Otherwise show normal code entry UI
return (
  <div>
    <h2>Enter Verification Code</h2>
    <input ... />
    <Button onClick={handleResendCode}>Resend Code</Button>
  </div>
);
```

---

## Edge Cases Covered

| Scenario | Behavior |
|----------|----------|
| User signs in | Auto-send ✓ |
| User refreshes MFA page | Show "Send Code" button |
| User opens multiple tabs | Only first tab auto-sends |
| User abandons, comes back later | Show "Send Code" button |
| User clicks "Resend" | Manual send ✓ |
| Code expires | Show "Send Code" button |

---

## Files to Change

1. `src/pages/SignIn.tsx` - Add `isInitialSignIn: true` to navigation state
2. `src/components/ProtectedRoute.tsx` - Add `isInitialSignIn: false` to navigation state
3. `src/pages/auth/MFAChallenge.tsx` - Check flag, conditionally auto-send
4. Add rate limiting to `send-mfa-code` edge function (3 codes per 5 min)

---

## Testing Checklist

- [ ] Sign in → Code auto-sent ✓
- [ ] Refresh MFA page → Button shown, no auto-send ✓
- [ ] Click "Send Code" button → Code sent ✓
- [ ] Click "Resend" → Code sent (after 30s cooldown) ✓
- [ ] Open 2 tabs → Only first tab auto-sends ✓
- [ ] Navigate to protected route after 24hrs → Button shown ✓
- [ ] Rate limit: Try 4 sends in 5 min → 4th blocked ✓

---

## Timeline

**Week 1**: Implementation + Testing
**Week 2**: Staging QA + Production Deploy

**Effort**: 3-5 days

---

## Success Metrics

**Before**:
- Average 2.5 codes per MFA session (initial + refresh + resend)
- Cost: ~$0.021 per session

**After**:
- Average 1.2 codes per MFA session (initial + occasional resend)
- Cost: ~$0.010 per session

**Savings**: 52% reduction in codes sent = ~$400/year at 500 users

---

**Status**: Ready to implement
**Complexity**: Low
**Risk**: Low
**ROI**: High
