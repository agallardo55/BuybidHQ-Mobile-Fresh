# useCurrentUser Diagnostic Guide

## Overview
The `useCurrentUser` hook now includes comprehensive diagnostic instrumentation to identify performance issues and interval leaks.

## Diagnostic Features

### 1. **Automatic Periodic Logging**
Every 5 seconds, the console will log diagnostic information if there are active instances or intervals:
```javascript
🔍 useCurrentUser DIAGNOSTICS: {
  activeInstances: 2,           // Number of hook instances currently mounted
  activeIntervals: 0,           // Number of intervals currently running (should be 0 when idle)
  totalCreated: 15,             // Total intervals created since page load
  totalCleared: 15,             // Total intervals cleared since page load
  intervalLeaks: 0,             // Difference (should be 0 - indicates leaks if > 0)
  queryStats: {
    executions: 5,              // Total queries executed
    completions: 4,             // Successful completions
    errors: 1,                  // Errors encountered
    timeouts: 0                 // Timeouts occurred
  },
  intervalFireCounts: []        // How many times each interval fired
}
```

### 2. **Mount/Unmount Tracking**
Each hook instance logs when it mounts and unmounts:
```
🔍 useCurrentUser: Hook MOUNTED [abc123xyz]
🔍 useCurrentUser: Hook UNMOUNTED [abc123xyz] (lifetime: 5000ms)
```

### 3. **Query Execution Tracking**
Each query execution is tracked with:
- Query start/completion
- Duration
- Success/error/timeout status
- Instance ID for correlation

## What to Look For

### ✅ **Healthy State**
- `activeIntervals: 0` when no queries are running
- `intervalLeaks: 0` (created === cleared)
- `activeInstances` matches expected number of components using the hook
- Queries complete within 1-2 seconds

### ⚠️ **Warning Signs**
- `intervalLeaks > 0` - Intervals not being cleared properly
- `activeIntervals > 0` when idle - Leaked intervals still running
- `activeInstances` growing over time - Components not unmounting
- High `intervalFireCounts` - Intervals firing too many times before cleanup
- Queries taking > 3 seconds consistently

### 🚨 **Critical Issues**
- `intervalLeaks` continuously increasing - Memory leak
- `activeIntervals` growing without bound - Performance degradation
- Multiple instances mounting/unmounting rapidly - Re-render loop

## Testing Isolation

To test if `useCurrentUser` is causing unresponsiveness:

1. **Disable the hook temporarily:**
   ```typescript
   // In src/hooks/useCurrentUser.ts, line 70
   const DISABLE_HOOK_FOR_TESTING = true;
   ```

2. **Reload the app** - If responsiveness improves, the hook is the issue

3. **Re-enable and check diagnostics:**
   ```typescript
   const DISABLE_HOOK_FOR_TESTING = false;
   ```

## React Query Configuration

Current settings:
- `staleTime: 30000` (30 seconds) - Data considered fresh for 30s
- `gcTime: 5 * 60 * 1000` (5 minutes) - Cache kept for 5 minutes
- `refetchOnWindowFocus: false` - No refetch on tab focus
- `refetchOnMount: false` - No refetch on component mount
- `retry: < 2` - Max 2 retries
- `enabled: !!authUser` - Only runs when user is authenticated

## Next Steps

1. **Monitor the console** for diagnostic logs
2. **Check for interval leaks** - Look for `intervalLeaks > 0`
3. **Verify cleanup** - Ensure `activeIntervals: 0` when idle
4. **Test isolation** - Disable hook if needed to confirm it's the issue
5. **Check React DevTools Profiler** - Look for excessive re-renders
6. **Use Chrome Performance tab** - Record and analyze for blocking operations

## Expected Behavior

- **On page load:** 1-2 instances mount, 1 query executes, completes in < 2s
- **During navigation:** Instances unmount/remount, intervals always cleared
- **When idle:** `activeIntervals: 0`, `intervalLeaks: 0`
- **On errors:** Query fails gracefully, interval still cleared

## Fix Applied

✅ Added `finally` block to ensure interval cleanup even on unexpected errors
✅ Comprehensive diagnostic tracking for all intervals
✅ Mount/unmount lifecycle tracking
✅ Query execution metrics
✅ Test mode for isolation testing

