-- Create function to restore deleted user accounts
CREATE OR REPLACE FUNCTION public.restore_deleted_account(
  p_email text,
  p_full_name text,
  p_mobile_number text,
  p_address text,
  p_city text,
  p_state text,
  p_zip_code text,
  p_sms_consent boolean,
  p_carrier text DEFAULT NULL
)
RETURNS TABLE(
  user_id uuid,
  was_restored boolean,
  auth_user_exists boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_user RECORD;
  v_auth_exists boolean;
BEGIN
  -- Check if user exists in deleted_users
  SELECT * INTO v_deleted_user
  FROM deleted_users
  WHERE email = p_email
  ORDER BY deleted_at DESC
  LIMIT 1;
  
  -- Check if auth user exists
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = p_email
  ) INTO v_auth_exists;
  
  -- If found in deleted_users, restore the account
  IF v_deleted_user.id IS NOT NULL THEN
    -- Move user back to buybidhq_users with updated data
    INSERT INTO buybidhq_users (
      id,
      email,
      full_name,
      mobile_number,
      address,
      city,
      state,
      zip_code,
      role,
      app_role,
      status,
      is_active,
      sms_consent,
      phone_carrier,
      created_at,
      updated_at,
      deleted_at,
      account_id
    ) VALUES (
      v_deleted_user.id,
      p_email,
      p_full_name,
      p_mobile_number,
      p_address,
      p_city,
      p_state,
      p_zip_code,
      'basic'::user_role,
      'member'::text,
      'active'::text,
      true,
      p_sms_consent,
      p_carrier,
      v_deleted_user.original_created_at,
      NOW(),
      NULL,
      NULL -- Clear account_id for fresh start
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = p_full_name,
      mobile_number = p_mobile_number,
      address = p_address,
      city = p_city,
      state = p_state,
      zip_code = p_zip_code,
      status = 'active',
      is_active = true,
      sms_consent = p_sms_consent,
      phone_carrier = p_carrier,
      updated_at = NOW(),
      deleted_at = NULL,
      account_id = NULL;
    
    -- Remove from deleted_users
    DELETE FROM deleted_users WHERE id = v_deleted_user.id;
    
    -- Return success
    RETURN QUERY SELECT v_deleted_user.id, true, v_auth_exists;
  ELSE
    -- Not a deleted user
    RETURN QUERY SELECT NULL::uuid, false, v_auth_exists;
  END IF;
END;
$$;