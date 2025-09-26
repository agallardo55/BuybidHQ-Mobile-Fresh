-- Complete Super Admin RLS Policy Implementation (Phase 2)
-- This adds the remaining Super Admin policies while avoiding duplicates

-- Phase 2: Business Data Tables (vehicles, reconditioning, images, bid_responses, bid_submission_tokens)

-- Vehicles - Add Super Admin access to existing user access
DROP POLICY IF EXISTS "Users can view vehicles through their bid requests" ON public.vehicles;
DROP POLICY IF EXISTS "Users can create vehicles for their bid requests" ON public.vehicles;
DROP POLICY IF EXISTS "Users and super admin can view vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users and super admin can create vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Super admin can update vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Super admin can delete vehicles" ON public.vehicles;

CREATE POLICY "Users and super admin can view vehicles" ON public.vehicles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.vehicle_id = vehicles.id AND can_access_bid_request(auth.uid(), br.id)
  )
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

CREATE POLICY "Users and super admin can create vehicles" ON public.vehicles
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "Super admin can update vehicles" ON public.vehicles
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

CREATE POLICY "Super admin can delete vehicles" ON public.vehicles
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- Reconditioning - Add Super Admin access
DROP POLICY IF EXISTS "Users can view reconditioning through vehicles" ON public.reconditioning;
DROP POLICY IF EXISTS "Users can create reconditioning records" ON public.reconditioning;
DROP POLICY IF EXISTS "Users and super admin can view reconditioning" ON public.reconditioning;
DROP POLICY IF EXISTS "Users and super admin can create reconditioning" ON public.reconditioning;
DROP POLICY IF EXISTS "Super admin can update reconditioning" ON public.reconditioning;
DROP POLICY IF EXISTS "Super admin can delete reconditioning" ON public.reconditioning;

CREATE POLICY "Users and super admin can view reconditioning" ON public.reconditioning
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vehicles v
    JOIN bid_requests br ON br.vehicle_id = v.id
    WHERE (v.id = reconditioning.vehicle_id OR br.recon = reconditioning.id) 
    AND can_access_bid_request(auth.uid(), br.id)
  )
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

CREATE POLICY "Users and super admin can create reconditioning" ON public.reconditioning
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "Super admin can update reconditioning" ON public.reconditioning
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

CREATE POLICY "Super admin can delete reconditioning" ON public.reconditioning
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- Images - Add Super Admin access
DROP POLICY IF EXISTS "Users can view images for their accessible bid requests" ON public.images;
DROP POLICY IF EXISTS "Users can insert images for their bid requests" ON public.images;
DROP POLICY IF EXISTS "Users and super admin can view images" ON public.images;
DROP POLICY IF EXISTS "Users and super admin can insert images" ON public.images;
DROP POLICY IF EXISTS "Super admin can update images" ON public.images;
DROP POLICY IF EXISTS "Super admin can delete images" ON public.images;

CREATE POLICY "Users and super admin can view images" ON public.images
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.id = images.bid_request_id AND can_access_bid_request(auth.uid(), br.id)
  )
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

CREATE POLICY "Users and super admin can insert images" ON public.images
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.id = images.bid_request_id AND br.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

CREATE POLICY "Super admin can update images" ON public.images
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

CREATE POLICY "Super admin can delete images" ON public.images
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- Bid Responses - Update existing admin policy
DROP POLICY IF EXISTS "Admin full access to bid responses" ON public.bid_responses;
DROP POLICY IF EXISTS "Users and super admin access to bid responses" ON public.bid_responses;

CREATE POLICY "Users and super admin access to bid responses" ON public.bid_responses
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM bid_requests
    WHERE bid_requests.id = bid_responses.bid_request_id AND bid_requests.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM bid_requests
    WHERE bid_requests.id = bid_responses.bid_request_id AND bid_requests.user_id = auth.uid()
  )
);

-- Bid Submission Tokens - Update existing policies
DROP POLICY IF EXISTS "System can validate bid tokens" ON public.bid_submission_tokens;
DROP POLICY IF EXISTS "System can update bid tokens" ON public.bid_submission_tokens;
DROP POLICY IF EXISTS "Edge functions can create bid tokens" ON public.bid_submission_tokens;
DROP POLICY IF EXISTS "Admins can delete bid tokens" ON public.bid_submission_tokens;
DROP POLICY IF EXISTS "System and super admin can view bid tokens" ON public.bid_submission_tokens;
DROP POLICY IF EXISTS "System and super admin can create bid tokens" ON public.bid_submission_tokens;
DROP POLICY IF EXISTS "System and super admin can update bid tokens" ON public.bid_submission_tokens;
DROP POLICY IF EXISTS "Super admin can delete bid tokens" ON public.bid_submission_tokens;

CREATE POLICY "System and super admin can view bid tokens" ON public.bid_submission_tokens
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'role') = 'service_role'
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.id = bid_submission_tokens.bid_request_id AND br.user_id = auth.uid()
  )
);

CREATE POLICY "System and super admin can create bid tokens" ON public.bid_submission_tokens
FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'role') = 'service_role'
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.id = bid_submission_tokens.bid_request_id AND br.user_id = auth.uid()
  )
);

CREATE POLICY "System and super admin can update bid tokens" ON public.bid_submission_tokens
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'role') = 'service_role'
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.id = bid_submission_tokens.bid_request_id AND br.user_id = auth.uid()
  )
);

CREATE POLICY "Super admin can delete bid tokens" ON public.bid_submission_tokens
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
  OR EXISTS (
    SELECT 1 FROM bid_requests br
    WHERE br.id = bid_submission_tokens.bid_request_id AND br.user_id = auth.uid()
  )
);

-- Phase 3: System & Security tables

-- User Security Events - Update existing policy
DROP POLICY IF EXISTS "Users can view their own security events" ON public.user_security_events;
DROP POLICY IF EXISTS "Users and super admin can view security events" ON public.user_security_events;

CREATE POLICY "Users and super admin can view security events" ON public.user_security_events
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- User Sessions - Update existing policies  
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users and super admin can view sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users and super admin can update sessions" ON public.user_sessions;

CREATE POLICY "Users and super admin can view sessions" ON public.user_sessions
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

CREATE POLICY "Users and super admin can update sessions" ON public.user_sessions
FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- MFA Settings - Add Super Admin read access
DROP POLICY IF EXISTS "Super admin read access to mfa settings" ON public.mfa_settings;
CREATE POLICY "Super admin read access to mfa settings" ON public.mfa_settings
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- Password Reset Attempts - Add Super Admin access
DROP POLICY IF EXISTS "Super admin access to password reset attempts" ON public.password_reset_attempts;
CREATE POLICY "Super admin access to password reset attempts" ON public.password_reset_attempts
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- Phase 4: Billing & Usage

-- Subscriptions - Update existing admin policy
DROP POLICY IF EXISTS "Admin full access to subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users and super admin access to subscriptions" ON public.subscriptions;

CREATE POLICY "Users and super admin access to subscriptions" ON public.subscriptions
FOR ALL TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- Bid Usage - Add Super Admin access
DROP POLICY IF EXISTS "Super admin full access to bid usage" ON public.bid_usage;
CREATE POLICY "Super admin full access to bid usage" ON public.bid_usage
FOR ALL TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- Phase 5: Reference Data

-- Book Values - Update existing policy
DROP POLICY IF EXISTS "Users can view book values through their vehicles" ON public."bookValues";
DROP POLICY IF EXISTS "Users and super admin can view book values" ON public."bookValues";

CREATE POLICY "Users and super admin can view book values" ON public."bookValues"
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vehicles v
    JOIN bid_requests br ON br.vehicle_id = v.id
    WHERE v.id = "bookValues".vehicle_id AND can_access_bid_request(auth.uid(), br.id)
  )
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- Vehicle History - Update existing policy
DROP POLICY IF EXISTS "Users can view vehicle history through their vehicles" ON public.vehicle_history;
DROP POLICY IF EXISTS "Users and super admin can view vehicle history" ON public.vehicle_history;

CREATE POLICY "Users and super admin can view vehicle history" ON public.vehicle_history
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vehicles v
    JOIN bid_requests br ON br.vehicle_id = v.id
    WHERE v.id = vehicle_history.vehicle_id AND can_access_bid_request(auth.uid(), br.id)
  )
  OR EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- Contact Submissions - Update existing policy
DROP POLICY IF EXISTS "Admin only read access to contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Super admin read access to contact submissions" ON public.contact_submissions;

CREATE POLICY "Super admin read access to contact submissions" ON public.contact_submissions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

-- Waitlist - Update existing admin policies
DROP POLICY IF EXISTS "Restricted waitlist access" ON public.waitlist;
DROP POLICY IF EXISTS "Admins can update waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Admins can delete waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Users and super admin can view waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Super admin can update waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Super admin can delete waitlist" ON public.waitlist;

CREATE POLICY "Users and super admin can view waitlist" ON public.waitlist
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
  OR (auth.uid() IS NOT NULL AND email = (auth.jwt() ->> 'email'))
);

CREATE POLICY "Super admin can update waitlist" ON public.waitlist
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);

CREATE POLICY "Super admin can delete waitlist" ON public.waitlist
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_current_user_data() 
    WHERE is_admin = true
  )
);