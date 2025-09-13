-- Fix critical security issue: Restrict contact submissions read access to admin users only
DROP POLICY IF EXISTS "Admins can view contact submissions" ON contact_submissions;

-- Create proper admin-only read policy for contact submissions
CREATE POLICY "Admin only read access to contact submissions" 
ON contact_submissions 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Verify the public insert policy is still in place (anyone can submit contact form)
-- The existing "Anyone can submit contact form" INSERT policy should remain unchanged