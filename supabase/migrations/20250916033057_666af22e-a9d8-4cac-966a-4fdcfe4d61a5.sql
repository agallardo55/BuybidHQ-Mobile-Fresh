-- Fix dealerships RLS policies to allow INSERT operations

-- Drop the existing overly restrictive policy
DROP POLICY IF EXISTS "Admin full access to dealerships" ON public.dealerships;

-- Create separate policies for better access control
CREATE POLICY "Admin can view all dealerships" 
ON public.dealerships 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM buybidhq_users 
    WHERE id = auth.uid() 
    AND dealership_id = dealerships.id
  ))
);

CREATE POLICY "Admin can insert dealerships" 
ON public.dealerships 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin can update dealerships" 
ON public.dealerships 
FOR UPDATE 
USING (
  is_admin(auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM buybidhq_users 
    WHERE id = auth.uid() 
    AND dealership_id = dealerships.id
  ))
)
WITH CHECK (
  is_admin(auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM buybidhq_users 
    WHERE id = auth.uid() 
    AND dealership_id = dealerships.id
  ))
);

CREATE POLICY "Admin can delete dealerships" 
ON public.dealerships 
FOR DELETE 
USING (is_admin(auth.uid()));