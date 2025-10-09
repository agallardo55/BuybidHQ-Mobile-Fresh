-- =====================================================
-- PHASE 1: CRITICAL SECURITY FIXES
-- =====================================================

-- =====================================================
-- 1. CREATE USER ROLES TABLE (Privilege Escalation Fix)
-- =====================================================

-- Create user_roles table for secure role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.buybidhq_users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  granted_by UUID REFERENCES public.buybidhq_users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles(user_id, is_active);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.user_has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
  )
$$;

-- Migrate existing roles from buybidhq_users to user_roles
INSERT INTO public.user_roles (user_id, role, granted_at, is_active)
SELECT 
  id,
  app_role,
  created_at,
  is_active
FROM public.buybidhq_users
WHERE deleted_at IS NULL
  AND app_role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Create RLS policies on user_roles table
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.user_has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Account admins can view roles in their account"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.user_has_role(auth.uid(), 'account_admin')
  AND user_id IN (
    SELECT id FROM public.buybidhq_users 
    WHERE account_id = (SELECT account_id FROM public.buybidhq_users WHERE id = auth.uid())
  )
);

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- =====================================================
-- 2. RESTRICT PUBLIC CAROUSEL ACCESS (Competitor Scraping Fix)
-- =====================================================

-- Drop overly permissive public carousel policies
DROP POLICY IF EXISTS "Public carousel: approved recent bid requests only" ON public.bid_requests;
DROP POLICY IF EXISTS "Public carousel: responses for approved bids only" ON public.bid_responses;
DROP POLICY IF EXISTS "Public carousel: images for approved bids only" ON public.images;

-- Revoke direct public access to sensitive tables
REVOKE SELECT ON public.bid_requests FROM anon;
REVOKE SELECT ON public.bid_responses FROM anon;
REVOKE SELECT ON public.vehicles FROM anon;
REVOKE SELECT ON public.images FROM anon;

-- Create secure, minimal carousel view with security_barrier
CREATE OR REPLACE VIEW public.carousel_recent_vehicles
WITH (security_barrier = true) AS
SELECT 
  br.id,
  br.created_at,
  v.year,
  v.make,
  v.model,
  v.mileage,
  (SELECT i.image_url FROM public.images i WHERE i.bid_request_id = br.id ORDER BY i.sequence_order, i.created_at LIMIT 1) as image_url,
  (SELECT MAX(resp.offer_amount) FROM public.bid_responses resp WHERE resp.bid_request_id = br.id) as highest_offer
FROM public.bid_requests br
JOIN public.vehicles v ON br.vehicle_id = v.id
WHERE br.status = 'Approved'
  AND br.created_at >= (NOW() - INTERVAL '30 days')
ORDER BY br.created_at DESC
LIMIT 10;

-- Grant SELECT access ONLY on the secure view to anonymous users
GRANT SELECT ON public.carousel_recent_vehicles TO anon;

-- Add comment explaining the security model
COMMENT ON VIEW public.carousel_recent_vehicles IS 
'Security-hardened view for public carousel. Only exposes minimal, anonymized data for approved bid requests from last 30 days. Direct table access is blocked for anon users.';