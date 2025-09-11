-- CRITICAL SECURITY FIXES (Part 2)

-- Drop existing storage policies first, then recreate them securely
DROP POLICY IF EXISTS "Users can view vehicle images for their accessible bid requests" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload vehicle images for their bid requests" ON storage.objects;

-- 4. Secure the vehicle_images storage bucket (make it private)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'vehicle_images';

-- Create proper storage policies for vehicle_images
CREATE POLICY "Secure vehicle image access"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vehicle_images' AND (
    EXISTS (
      SELECT 1 FROM images i
      JOIN bid_requests br ON i.bid_request_id = br.id
      WHERE i.image_url LIKE '%' || storage.objects.name || '%'
      AND can_access_bid_request(auth.uid(), br.id)
    ) OR is_admin(auth.uid())
  )
);

CREATE POLICY "Secure vehicle image upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle_images' AND 
  auth.uid() IS NOT NULL
);