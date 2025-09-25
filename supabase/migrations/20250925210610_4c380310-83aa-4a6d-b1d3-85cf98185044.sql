-- Create individual accounts for all users who don't have one
-- This ensures all users can create and manage their own buyers

DO $$
DECLARE
    user_record RECORD;
    new_account_id UUID;
BEGIN
    -- Loop through all users who don't have an account_id
    FOR user_record IN 
        SELECT id, email, full_name 
        FROM buybidhq_users 
        WHERE account_id IS NULL 
        AND deleted_at IS NULL
    LOOP
        -- Create a new account for this user
        INSERT INTO accounts (name, plan)
        VALUES (
            CASE 
                WHEN user_record.full_name IS NOT NULL 
                THEN user_record.full_name || '''s Account'
                ELSE user_record.email || '''s Account'
            END,
            'free'
        )
        RETURNING id INTO new_account_id;
        
        -- Update the user to link to their new account
        UPDATE buybidhq_users 
        SET account_id = new_account_id
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Created account % for user %', new_account_id, user_record.email;
    END LOOP;
END $$;