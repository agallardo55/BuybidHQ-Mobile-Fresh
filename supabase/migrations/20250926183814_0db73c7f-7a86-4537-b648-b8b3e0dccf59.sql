-- Step 1: Account Separation and Role Updates
-- Move adamgallardo@me.com to separate account and update their role

-- First, get the user ID for adamgallardo@me.com
DO $$
DECLARE
    adam_gallardo_id UUID;
    target_account_id UUID := 'ecca56c0-f1d6-4e68-b4ae-d7b8a559a20f';
BEGIN
    -- Get adamgallardo@me.com user ID
    SELECT id INTO adam_gallardo_id
    FROM buybidhq_users
    WHERE email = 'adamgallardo@me.com';
    
    IF adam_gallardo_id IS NULL THEN
        RAISE EXCEPTION 'User adamgallardo@me.com not found';
    END IF;
    
    -- Update adamgallardo@me.com user record
    UPDATE buybidhq_users
    SET 
        account_id = target_account_id,
        app_role = 'member'
    WHERE id = adam_gallardo_id;
    
    -- Update their bid requests to have the correct account_id
    UPDATE bid_requests
    SET account_id = target_account_id
    WHERE user_id = adam_gallardo_id AND account_id IS NULL;
    
    -- Update their buyers to have the correct account_id
    UPDATE buyers
    SET account_id = target_account_id
    WHERE user_id = adam_gallardo_id AND account_id IS NULL;
    
    -- Update the target account to be a paid plan
    UPDATE accounts
    SET 
        plan = 'connect',
        billing_status = 'active',
        name = 'Adam Gallardo Account',
        seat_limit = 1,
        updated_at = now()
    WHERE id = target_account_id;
    
    RAISE NOTICE 'Successfully moved user % to account % and updated % bid requests', 
        adam_gallardo_id, target_account_id, 
        (SELECT COUNT(*) FROM bid_requests WHERE user_id = adam_gallardo_id);
END $$;