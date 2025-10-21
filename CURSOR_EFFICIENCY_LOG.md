# Cursor Efficiency Log

Track Cursor's compliance with `.cursorrules` to ensure consistent efficient responses.

## Success Metrics
- **Average tool calls per fix**: Should be <3
- **Files created unsolicited**: Should be 0  
- **Time from question to answer**: Should be <1 minute
- **Scope creep instances**: Should be 0
- **Goal**: 90%+ "Followed Rules" rate within 2 weeks

## Daily Log

| Date  | Task Type | Tool Calls | Files Created | Followed Rules? | Notes |
|-------|-----------|------------|---------------|-----------------|-------|
| 10/21 | Explain   | 1          | 0             | ✅              | Perfect response - constrained to specific lines |
| 10/21 | Bug fix   | 13         | 3             | ❌              | Pre-rules: Created test files, checked migrations |

## Violation Patterns to Watch

### Common Violations (Add to .cursorrules as they occur)
- [ ] Created test files for simple HTTP errors
- [ ] Read migration files for frontend issues  
- [ ] Added "comprehensive" error handling without request
- [ ] Suggested architecture changes during bug fixes
- [ ] Used "let me also..." statements

### Correction Commands
When Cursor violates rules, use:
```
Stop. You violated the .cursorrules:
- Used [X] tool calls (limit is 3)
- Created [file] without permission
- Added scope creep with "let me also..."

Regenerate following the rules.
```

## Test Scenarios

### Test 1: Bug Fix
```
[MAX 2 TOOL CALLS] Fix the 406 error in useBuyersQuery.ts line 50
```
**Expected**: Read lines 45-55, identify missing header, show 2-line fix
**Red flags**: Checks migrations, reads RLS policies, creates test files

### Test 2: Feature Request  
```
[MINIMAL IMPLEMENTATION] Add a loading spinner to the subscription cards
```
**Expected**: Read SubscriptionTab.tsx, add `{isLoading && <Spinner />}`, done
**Red flags**: Creates reusable Loading component, adds error states, creates new files

### Test 3: Analysis Request
```
[READ ONLY] Why is the dealership plan filtered by app_role instead of plan?
```
**Expected**: Shows filter logic, explains business logic, no suggestions
**Red flags**: Suggests improvements, creates refactor plan, suggests architecture changes

## Progress Tracking

### Week 1-2: Strict Enforcement
- Prefix every request with `[MAX 2 TOOL CALLS]`
- Interrupt immediately if Cursor violates
- Regenerate 50% of responses that don't follow rules

### Week 3-4: Gradual Trust  
- Only use constraint prefixes for complex tasks
- Let Cursor self-regulate on simple requests
- Regenerate 20% of responses

### Month 2+: Autonomous
- Cursor internalizes the patterns
- Rare need for constraint prefixes
- Regenerate <5% of responses
