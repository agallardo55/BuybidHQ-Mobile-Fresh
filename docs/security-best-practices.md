# Security Best Practices for BuybidHQ

## Row Level Security (RLS) Guidelines

### 1. Avoid Infinite Recursion in RLS Policies

**Rule**: Never query the same table within its own RLS policy.

**Why**: When a policy queries its own table, it triggers the policy again, creating an infinite loop that crashes the database query.

**Example of Problem**:
```sql
-- ❌ This causes infinite recursion
CREATE POLICY "policy_name" ON public.table_a
USING (
  (SELECT field FROM public.table_a WHERE ...) -- Queries table_a in table_a's policy
);
```

**Solution**: Use SECURITY DEFINER functions that query OTHER tables:
```sql
-- ✅ Create a security definer function
CREATE FUNCTION check_permission(user_id uuid) RETURNS boolean
SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM other_table WHERE ... -- Query a different table
  );
$$ LANGUAGE sql STABLE;

-- ✅ Use the function in the policy
CREATE POLICY "policy_name" ON public.table_a
USING (check_permission(auth.uid()));
```

### 2. Use Security Definer Functions Carefully

**Purpose**: SECURITY DEFINER functions execute with the privileges of the function owner, bypassing RLS.

**When to Use**:
- Breaking RLS recursion cycles
- Centralized permission checking
- Performance optimization (caching role checks)

**Best Practices**:
```sql
CREATE OR REPLACE FUNCTION public.function_name(params)
RETURNS return_type
LANGUAGE sql
STABLE                    -- Mark as STABLE if it doesn't modify data
SECURITY DEFINER          -- Execute with owner's privileges
SET search_path = public  -- Prevent injection attacks
AS $$
  -- Function body
$$;

-- Always add comments
COMMENT ON FUNCTION public.function_name IS 
'Description of what it does and why it needs SECURITY DEFINER';
```

### 3. Always Enable RLS on Public Tables

```sql
-- Enable RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner
ALTER TABLE public.table_name FORCE ROW LEVEL SECURITY;
```

### 4. Test RLS Policies Thoroughly

**Test as different users**:
```sql
-- Test as anonymous user
SET ROLE anon;
SELECT * FROM table_name; -- Should see only public data

-- Test as authenticated user
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'user-uuid-here';
SELECT * FROM table_name; -- Should see user's data

-- Test as admin
-- Should see all data
```

### 5. Document Security Functions

Always add comments explaining:
- Why the function needs SECURITY DEFINER
- What tables it queries
- What security it enforces

```sql
COMMENT ON FUNCTION public.function_name IS 
'Purpose: Check if user can access resource
Security: Uses SECURITY DEFINER to bypass RLS on lookup table
Tables: Queries permissions_table, not the protected table
Used By: RLS policies on protected_table';
```

## Checklist for New RLS Policies

- [ ] Does the policy query its own table? (If yes, refactor)
- [ ] Are security definer functions documented?
- [ ] Is `SET search_path = public` included?
- [ ] Are functions marked STABLE when appropriate?
- [ ] Have you tested with different user roles?
- [ ] Have you checked for performance impact?
- [ ] Is the pattern documented in data-model.md?

## Common Patterns

### Pattern 1: Role-Based Access
```sql
-- Function
CREATE FUNCTION has_role(uid uuid, role_name text) 
RETURNS boolean SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = uid AND role = role_name
  );
$$ LANGUAGE sql STABLE;

-- Policy
CREATE POLICY "admins_access" ON protected_table
USING (has_role(auth.uid(), 'admin'));
```

### Pattern 2: Account-Based Access
```sql
-- Function
CREATE FUNCTION user_in_account(uid uuid, acct_id uuid)
RETURNS boolean SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM account_members
    WHERE user_id = uid AND account_id = acct_id
  );
$$ LANGUAGE sql STABLE;

-- Policy
CREATE POLICY "account_access" ON protected_table
USING (user_in_account(auth.uid(), account_id));
```

### Pattern 3: Resource Ownership
```sql
-- Direct check (safe, no recursion)
CREATE POLICY "owner_access" ON protected_table
USING (user_id = auth.uid());
```

## Migration Checklist

When modifying RLS policies:
- [ ] Create migration file with descriptive name
- [ ] Include comments explaining the change
- [ ] Test on local database first
- [ ] Verify no recursion errors in logs
- [ ] Update documentation
- [ ] Test all user roles after migration
- [ ] Monitor production logs after deployment

## Real-World Example: buybidhq_users Fix

**Problem Encountered (January 2025)**:
The `buybidhq_users` table had RLS policies that queried `buybidhq_users` within their own definitions:
```sql
-- ❌ This caused infinite recursion
CREATE POLICY "Account admins can view their account users"
ON public.buybidhq_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM buybidhq_users requester  -- Queries itself!
    WHERE requester.id = auth.uid()
    AND requester.app_role = 'account_admin'
    ...
  )
);
```

**Error Seen**: "infinite recursion detected in policy for relation buybidhq_users"

**Solution Implemented**:
Created security definer functions that query the `account_administrators` table instead:
```sql
-- ✅ Query a different table
CREATE FUNCTION is_account_admin_safe(p_user_id uuid, p_target_account_id uuid)
RETURNS boolean
SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM account_administrators  -- Different table!
    WHERE user_id = p_user_id
    AND account_id = p_target_account_id
    AND status = 'active'
  );
$$ LANGUAGE sql STABLE;

-- ✅ Use the function in policy
CREATE POLICY "Account admins can view account users safe"
ON public.buybidhq_users
FOR SELECT
USING (can_view_account_users(auth.uid(), account_id));
```

**Lesson Learned**: Always use a separate table for role/permission lookups when writing RLS policies.

## Security Definer Functions Reference

### When to Use SECURITY DEFINER

✅ **Good Use Cases**:
- Breaking RLS recursion cycles
- Centralized permission checking across multiple tables
- Performance optimization (avoid repeated permission checks)
- Accessing system tables that require elevated privileges

❌ **Bad Use Cases**:
- Bypassing security for convenience
- Allowing users to escalate privileges
- Performing actions without proper authorization checks
- Direct data manipulation without validation

### Security Definer Template

```sql
CREATE OR REPLACE FUNCTION public.secure_function_name(
  p_param1 uuid,
  p_param2 text
)
RETURNS return_type
LANGUAGE sql  -- or plpgsql for complex logic
STABLE  -- or VOLATILE if function modifies data
SECURITY DEFINER
SET search_path = public  -- CRITICAL: Prevents SQL injection
AS $$
  -- Function body
  -- Use fully qualified names: public.table_name
  -- Add explicit security checks
  -- Document assumptions and requirements
$$;

-- Add comprehensive documentation
COMMENT ON FUNCTION public.secure_function_name IS 
'Purpose: [What does this function do?]
Security: [Why does it need SECURITY DEFINER?]
Parameters: [What parameters does it accept?]
Returns: [What does it return?]
Tables Accessed: [Which tables does it query?]
Used By: [Which RLS policies or code use this?]
Security Considerations: [Any special security notes?]';
```

## Monitoring and Debugging

### Check for Recursion Errors
```sql
-- Query Postgres logs for recursion errors
SELECT *
FROM postgres_logs
WHERE event_message ILIKE '%infinite recursion%'
ORDER BY timestamp DESC
LIMIT 50;
```

### Test RLS Policies
```sql
-- Enable role simulation
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'test-user-uuid';

-- Try queries that should work
SELECT * FROM protected_table WHERE id = 'owned-resource-id';

-- Try queries that should fail
SELECT * FROM protected_table WHERE id = 'unowned-resource-id';

-- Reset role
RESET ROLE;
```

### Performance Testing
```sql
-- Enable query timing
\timing on

-- Test policy performance
EXPLAIN ANALYZE SELECT * FROM protected_table LIMIT 100;

-- Check if policies are using indexes
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM protected_table WHERE user_id = 'test-uuid';
```

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Security Definer Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

## Summary

**Golden Rules**:
1. Never query a table within its own RLS policy
2. Use SECURITY DEFINER functions that query OTHER tables
3. Always set `search_path = public` in security definer functions
4. Document why each function needs SECURITY DEFINER
5. Test thoroughly with different user roles
6. Monitor for recursion errors in production

Following these patterns will prevent infinite recursion and maintain secure, performant RLS policies.
