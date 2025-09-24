-- Fix search path security issues for the new admin functions

-- Update is_super_admin function with proper search path
CREATE OR REPLACE FUNCTION public.is_super_admin(checking_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM super_administrators 
    WHERE user_id = checking_user_id AND status = 'active'
  );
$$;

-- Update is_account_admin function with proper search path
CREATE OR REPLACE FUNCTION public.is_account_admin(checking_user_id uuid, target_account_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM account_administrators 
    WHERE user_id = checking_user_id 
    AND (target_account_id IS NULL OR account_id = target_account_id)
    AND status = 'active'
  );
$$;

-- Update get_user_effective_role function with proper search path
CREATE OR REPLACE FUNCTION public.get_user_effective_role(checking_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check super admin first
  IF is_super_admin(checking_user_id) THEN
    RETURN 'super_admin';
  END IF;
  
  -- Check account admin
  IF is_account_admin(checking_user_id) THEN
    RETURN 'account_admin';
  END IF;
  
  -- Return regular app role
  RETURN (SELECT app_role FROM buybidhq_users WHERE id = checking_user_id);
END;
$$;