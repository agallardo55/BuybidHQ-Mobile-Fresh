-- Critical Security Fix: Protect dealer business information in unified_dealer_info view
-- This view currently exposes sensitive business data publicly

-- Enable Row Level Security on unified_dealer_info view
ALTER VIEW unified_dealer_info ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view dealer business information
CREATE POLICY "Admin only access to dealer business info" 
ON unified_dealer_info 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Allow dealers to view their own business information 
CREATE POLICY "Dealers can view their own business info" 
ON unified_dealer_info 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM buybidhq_users 
    WHERE id = auth.uid() 
    AND dealership_id = unified_dealer_info.id
  )
);