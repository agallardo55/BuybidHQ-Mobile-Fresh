-- CRITICAL SECURITY FIXES

-- 1. Fix RLS bypass in get_public_bid_request_details function
-- Add proper access control checks
CREATE OR REPLACE FUNCTION public.get_public_bid_request_details(p_token text)
 RETURNS TABLE(request_id uuid, created_at timestamp with time zone, status text, notes text, vehicle_year text, vehicle_make text, vehicle_model text, vehicle_trim text, vehicle_vin text, vehicle_mileage text, vehicle_engine text, vehicle_transmission text, vehicle_drivetrain text, buyer_name text, buyer_dealership text, buyer_mobile text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_token_valid boolean := false;
  v_bid_request_id uuid;
  v_buyer_id uuid;
BEGIN
  -- First validate the token with proper security checks
  SELECT 
    (NOT t.is_used AND t.expires_at > now()) as is_valid,
    t.bid_request_id,
    t.buyer_id
  INTO v_token_valid, v_bid_request_id, v_buyer_id
  FROM bid_submission_tokens t
  WHERE t.token = p_token
  LIMIT 1;

  -- If token is invalid, return empty result
  IF NOT v_token_valid OR v_bid_request_id IS NULL THEN
    RETURN;
  END IF;

  -- Additional security check: verify the bid request exists and is accessible
  IF NOT EXISTS (
    SELECT 1 FROM bid_requests 
    WHERE id = v_bid_request_id 
    AND status IN ('Pending', 'Active')
  ) THEN
    RETURN;
  END IF;

  -- Return sanitized bid request details for this specific token
  RETURN QUERY
  SELECT 
    br.id as request_id,
    br.created_at,
    br.status::text,
    COALESCE(bst.notes, '') as notes,
    COALESCE(v.year, 'N/A') as vehicle_year,
    COALESCE(v.make, 'N/A') as vehicle_make,
    COALESCE(v.model, 'N/A') as vehicle_model,
    COALESCE(v.trim, 'N/A') as vehicle_trim,
    COALESCE(v.vin, 'N/A') as vehicle_vin,
    COALESCE(v.mileage, 'N/A') as vehicle_mileage,
    COALESCE(v.engine, 'N/A') as vehicle_engine,
    COALESCE(v.transmission, 'N/A') as vehicle_transmission,
    COALESCE(v.drivetrain, 'N/A') as vehicle_drivetrain,
    COALESCE(u.full_name, 'N/A') as buyer_name,
    CASE 
      WHEN d.dealer_name IS NOT NULL THEN d.dealer_name
      ELSE 'Direct Buyer'
    END as buyer_dealership,
    COALESCE(u.mobile_number, 'N/A') as buyer_mobile
  FROM bid_requests br
  JOIN vehicles v ON br.vehicle_id = v.id
  JOIN buybidhq_users u ON br.user_id = u.id
  LEFT JOIN dealerships d ON u.dealership_id = d.id
  LEFT JOIN bid_submission_tokens bst ON bst.bid_request_id = br.id AND bst.buyer_id = v_buyer_id
  WHERE br.id = v_bid_request_id;
END;
$function$;

-- 2. Fix privilege escalation by adding missing WITH CHECK clause to buybidhq_users policy
DROP POLICY IF EXISTS "Admin access to all users" ON public.buybidhq_users;
CREATE POLICY "Admin access to all users" 
ON public.buybidhq_users 
FOR ALL 
USING (check_user_role_no_rls(auth.uid(), 'admin'::user_role))
WITH CHECK (check_user_role_no_rls(auth.uid(), 'admin'::user_role));

-- 3. Fix search_path issues in security-sensitive functions
CREATE OR REPLACE FUNCTION public.can_access_dealership(checking_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM buybidhq_users 
    WHERE id = checking_user_id
    AND deleted_at IS NULL
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_dealership(user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT dealership_id FROM buybidhq_users WHERE id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT role::text FROM buybidhq_users WHERE id = user_id;
$function$;

-- 4. Secure the vehicle_images storage bucket (make it private)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'vehicle_images';

-- Create proper storage policies for vehicle_images
CREATE POLICY "Users can view vehicle images for their accessible bid requests"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vehicle_images' AND (
    EXISTS (
      SELECT 1 FROM images i
      JOIN bid_requests br ON i.bid_request_id = br.id
      WHERE i.image_url = storage.objects.name
      AND can_access_bid_request(auth.uid(), br.id)
    ) OR is_admin(auth.uid())
  )
);

CREATE POLICY "Users can upload vehicle images for their bid requests"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle_images' AND (
    auth.uid() IS NOT NULL OR 
    is_admin(auth.uid())
  )
);