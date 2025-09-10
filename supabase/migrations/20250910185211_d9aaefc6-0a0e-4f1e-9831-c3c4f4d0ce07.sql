-- PHASE 2 CORRECTED: Enable RLS on remaining tables (with correct casing)

-- Enable RLS on cache tables (these are internal/admin tables)
ALTER TABLE public.user_access_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers_access_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealership_access_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_request_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_request_access_cache ENABLE ROW LEVEL SECURITY;

-- Enable RLS on other tables (correct casing)
ALTER TABLE public."bookValues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_validation_batch_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superadmin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_verifications ENABLE ROW LEVEL SECURITY;

-- Add policies for contact_submissions (public form submissions)
CREATE POLICY "Anyone can submit contact form" 
ON public.contact_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions" 
ON public.contact_submissions 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Add policies for bookValues (correct casing)
CREATE POLICY "Users can view book values through their vehicles" 
ON public."bookValues"
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v 
    JOIN public.bid_requests br ON br.vehicle_id = v.id 
    WHERE v.id = "bookValues".vehicle_id 
    AND can_access_bid_request(auth.uid(), br.id)
  ) OR is_admin(auth.uid())
);

-- Add policies for vehicle_history
CREATE POLICY "Users can view vehicle history through their vehicles" 
ON public.vehicle_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v 
    JOIN public.bid_requests br ON br.vehicle_id = v.id 
    WHERE v.id = vehicle_history.vehicle_id 
    AND can_access_bid_request(auth.uid(), br.id)
  ) OR is_admin(auth.uid())
);

-- Add restrictive policies for admin/cache tables (only admins can access)
CREATE POLICY "Admin only access" ON public.user_access_cache FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admin only access" ON public.user_role_cache FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admin only access" ON public.buyers_access_cache FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admin only access" ON public.dealership_access_cache FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admin only access" ON public.bid_request_access FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admin only access" ON public.bid_request_access_cache FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admin only access" ON public.phone_validation_batch_results FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admin only access" ON public.deleted_users FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admin only access" ON public.user_permissions FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admin only access" ON public.superadmin FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admin only access" ON public.mfa_verifications FOR ALL USING (is_admin(auth.uid()));