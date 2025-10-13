# Database Migration Instructions

## Apply Annual Plan Support Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `buybidhq`
3. Navigate to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy and paste the following SQL:

```sql
-- Add 'annual' to the accounts plan CHECK constraint
-- This allows the annual plan to be stored in the database

-- Drop the existing constraint
ALTER TABLE public.accounts 
DROP CONSTRAINT IF EXISTS accounts_plan_check;

-- Add the new constraint with 'annual' included
ALTER TABLE public.accounts 
ADD CONSTRAINT accounts_plan_check 
CHECK (plan IN ('free', 'connect', 'annual', 'group'));
```

6. Click **Run** or press `Cmd + Enter`
7. Verify success message appears

### Option 2: Supabase CLI (Alternative)

If you have CLI properly configured:

```bash
supabase db push
```

### Verification

After running the migration, verify it worked:

1. Go to **Table Editor** → `accounts` table
2. Click on any row to edit
3. Try to set `plan` to `annual` - it should be accepted
4. Or run this SQL query:

```sql
-- This should return the constraint with annual included
SELECT 
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'accounts' 
  AND con.conname = 'accounts_plan_check';
```

Expected result:
```
accounts_plan_check | CHECK ((plan = ANY (ARRAY['free'::text, 'connect'::text, 'annual'::text, 'group'::text])))
```

### Rollback (If Needed)

If you need to rollback this change:

```sql
ALTER TABLE public.accounts 
DROP CONSTRAINT IF EXISTS accounts_plan_check;

ALTER TABLE public.accounts 
ADD CONSTRAINT accounts_plan_check 
CHECK (plan IN ('free', 'connect', 'group'));
```

---

## Migration File Location

The migration file is saved at:
```
supabase/migrations/20251013020700_add_annual_plan_support.sql
```

This ensures it's tracked in version control and will be applied to future environments automatically.

