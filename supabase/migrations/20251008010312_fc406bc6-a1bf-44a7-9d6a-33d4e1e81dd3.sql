-- Update handle_user_deletion to handle re-deletion of previously deleted users
CREATE OR REPLACE FUNCTION public.handle_user_deletion(
  user_id uuid, 
  deleted_by_id uuid, 
  deletion_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Upsert into deleted_users (handles re-deletion)
  INSERT INTO deleted_users (
    id,
    original_created_at,
    deleted_by,
    email,
    full_name,
    role,
    mobile_number,
    address,
    city,
    state,
    zip_code,
    dealership_id,
    status,
    deletion_reason
  )
  SELECT
    id,
    created_at,
    deleted_by_id,
    email,
    full_name,
    role,
    mobile_number,
    address,
    city,
    state,
    zip_code,
    dealership_id,
    status,
    deletion_reason
  FROM buybidhq_users
  WHERE id = user_id
  ON CONFLICT (id) DO UPDATE SET
    deleted_at = NOW(),
    deleted_by = deleted_by_id,
    deletion_reason = EXCLUDED.deletion_reason,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    mobile_number = EXCLUDED.mobile_number,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    zip_code = EXCLUDED.zip_code,
    dealership_id = EXCLUDED.dealership_id,
    status = EXCLUDED.status;

  -- Update the user record (soft delete)
  UPDATE buybidhq_users
  SET
    deleted_at = NOW(),
    is_active = false,
    status = 'deleted'
  WHERE id = user_id;
END;
$$;