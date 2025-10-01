-- Drop the insecure public insert policy
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

-- Create secure service role insert policy
CREATE POLICY "Service role can insert contact submissions"
ON public.contact_submissions
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Ensure super admin read access policy exists
DROP POLICY IF EXISTS "Super admin read access to contact submissions" ON public.contact_submissions;

CREATE POLICY "Super admin read access to contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM get_current_user_data() 
    WHERE is_admin = true
  )
);