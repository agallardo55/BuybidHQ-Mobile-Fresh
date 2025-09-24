-- Create Super Administrators Table (replacing existing superadmin table)
CREATE TABLE public.super_administrators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  mobile_number text,
  granted_by uuid REFERENCES public.super_administrators(user_id),
  granted_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Create Account Administrators Table
CREATE TABLE public.account_administrators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  mobile_number text,
  granted_by uuid, -- Can be super_admin or another account_admin
  granted_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, account_id)
);

-- Enable RLS on both tables
ALTER TABLE public.super_administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_administrators ENABLE ROW LEVEL SECURITY;

-- Create updated_at triggers
CREATE TRIGGER update_super_administrators_updated_at
  BEFORE UPDATE ON public.super_administrators
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_account_administrators_updated_at
  BEFORE UPDATE ON public.account_administrators
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create Security Functions

-- Check if user is super admin
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

-- Check if user is account admin
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

-- Get user's effective role
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

-- RLS Policies for super_administrators
CREATE POLICY "Super admins can view all super admins"
ON public.super_administrators
FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert super admins"
ON public.super_administrators
FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update super admins"
ON public.super_administrators
FOR UPDATE
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete super admins"
ON public.super_administrators
FOR DELETE
USING (is_super_admin(auth.uid()));

-- RLS Policies for account_administrators
CREATE POLICY "Account admins can view their account admins"
ON public.account_administrators
FOR SELECT
USING (
  is_super_admin(auth.uid()) OR 
  (is_account_admin(auth.uid(), account_id) AND current_user_in_account(account_id))
);

CREATE POLICY "Super admins and account admins can insert account admins"
ON public.account_administrators
FOR INSERT
WITH CHECK (
  is_super_admin(auth.uid()) OR 
  (is_account_admin(auth.uid(), account_id) AND current_user_in_account(account_id))
);

CREATE POLICY "Super admins and account admins can update account admins"
ON public.account_administrators
FOR UPDATE
USING (
  is_super_admin(auth.uid()) OR 
  (is_account_admin(auth.uid(), account_id) AND current_user_in_account(account_id))
);

CREATE POLICY "Super admins and account admins can delete account admins"
ON public.account_administrators
FOR DELETE
USING (
  is_super_admin(auth.uid()) OR 
  (is_account_admin(auth.uid(), account_id) AND current_user_in_account(account_id))
);